import { getStandardDrumMusicXML } from './mockData';

export interface TranscriptionJobResult {
  xml: string;
  logs: string[];
  source: 'klangio' | 'basic-pitch' | 'demo';
}

/**
 * Service to handle drum audio and YouTube link transcription to MusicXML.
 */
export class TranscriptionService {
  
  /**
   * Main entry point to transcribe audio/YouTube.
   * Routes to Klangio, Spotify Basic Pitch, or honest demo fallback.
   */
  static async transcribe({
    fileData,
    youtubeUrl,
    mimeType,
    fileName,
    klangioApiKey
  }: {
    fileData?: string; // base64 string
    youtubeUrl?: string;
    mimeType?: string;
    fileName?: string;
    klangioApiKey?: string;
  }): Promise<TranscriptionJobResult> {
    const logs: string[] = [];
    const apiKey = klangioApiKey || process.env.KLANGIO_API_KEY;
    const basicPitchUrl = process.env.BASIC_PITCH_API_URL;

    // Log the initiation
    if (youtubeUrl) {
      logs.push(`Modtog YouTube-link til transskription: ${youtubeUrl}`);
    } else {
      logs.push(`Modtog lydfil: ${fileName || "unnamed.mp3"} (Mime: ${mimeType || "unknown"})`);
    }

    // 1. If Klangio API Key is available, run Klangio transcription
    if (apiKey && apiKey !== "sk-mock-klangio-key") {
      logs.push("Klangio API nøgle fundet. Opretter transskriberings-job...");
      try {
        const xml = await this.runKlangioTranscription(fileData, youtubeUrl, apiKey, logs);
        logs.push("Klangio transskribering fuldført med succes!");
        return { xml, logs, source: 'klangio' };
      } catch (error) {
        logs.push(`⚠️ Fejl under Klangio-transskribering: ${error instanceof Error ? error.message : String(error)}`);
        logs.push("Falder tilbage til lokal visning...");
      }
    }

    // 2. If Spotify Basic Pitch API URL is configured, run Basic Pitch
    if (basicPitchUrl && fileData) {
      logs.push("Spotify Basic Pitch API URL fundet. Sender lydfil til serverløs transskription...");
      try {
        const xml = await this.runBasicPitchTranscription(fileData, mimeType || "audio/mp3", basicPitchUrl, logs);
        logs.push("Basic Pitch transskribering fuldført!");
        return { xml, logs, source: 'basic-pitch' };
      } catch (error) {
        logs.push(`⚠️ Fejl under Basic Pitch kørsel: ${error instanceof Error ? error.message : String(error)}`);
        logs.push("Falder tilbage til lokal demonstration...");
      }
    }

    // 3. Fallback: Honest demo response
    logs.push("Ingen ekstern transskriberingstjeneste konfigureret (eller tjenesten er utilgængelig).");
    logs.push("Viser kurateret standardnodeark (Demo-tilstand).");
    const xml = await this.runLocalMockTranscription(youtubeUrl, fileName, logs);
    return { xml, logs, source: 'demo' };
  }

  /**
   * Communicates with Klangio REST API according to official documentation
   */
  private static async runKlangioTranscription(
    fileData: string | undefined,
    youtubeUrl: string | undefined,
    apiKey: string,
    logs: string[]
  ): Promise<string> {
    const klangioBaseUrl = process.env.KLANGIO_API_URL || "https://api.klang.io";
    
    logs.push("Kontakter Klangio server: Opretter transskribering...");
    
    const requestBody: Record<string, string> = {
      type: "drums",
    };

    if (youtubeUrl) {
      requestBody.youtubeUrl = youtubeUrl;
    } else if (fileData) {
      requestBody.audio = fileData; // base64
    } else {
      throw new Error("Hverken lydfil eller YouTube-link blev leveret.");
    }

    const response = await fetch(`${klangioBaseUrl}/transcription`, {
      method: "POST",
      headers: {
        "kl-api-key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Klangio API returnerede fejl: ${response.status} - ${errText}`);
    }

    const jobData = await response.json() as Record<string, unknown>;
    const jobId = (jobData.job_id || jobData.id || jobData.jobId) as string | undefined;
    if (!jobId) {
      throw new Error("Intet job-id modtaget fra Klangio API.");
    }
    logs.push(`Job oprettet hos Klangio med ID: ${jobId}`);

    // Poll for status
    let status = "IN_PROGRESS";
    let attempts = 0;
    const maxAttempts = 30; // 30 * 4 seconds = 2 mins max poll

    while ((status === "IN_PROGRESS" || status === "PROCESSING" || status === "QUEUED") && attempts < maxAttempts) {
      attempts++;
      logs.push(`[Polling ${attempts}/${maxAttempts}] Venter på at Klangio færdiggør transskription...`);
      await new Promise(resolve => setTimeout(resolve, 4000));

      const statusRes = await fetch(`${klangioBaseUrl}/job/${jobId}`, {
        headers: { 
          "kl-api-key": apiKey,
          "Authorization": `Bearer ${apiKey}` 
        }
      });

      if (!statusRes.ok) {
        logs.push(`⚠️ Kunne ikke hente jobstatus for ${jobId}. Prøver igen.`);
        continue;
      }

      const statusData = await statusRes.json() as Record<string, unknown>;
      status = String(statusData.status || "IN_PROGRESS").toUpperCase();

      if (status === "COMPLETED" || status === "SUCCESS") {
        logs.push("Klangio transskription fuldført! Downloader MusicXML...");
        const resultRes = await fetch(`${klangioBaseUrl}/job/${jobId}/xml`, {
          headers: { 
            "kl-api-key": apiKey,
            "Authorization": `Bearer ${apiKey}` 
          }
        });
        if (!resultRes.ok) {
          throw new Error("Kunne ikke hente den færdige MusicXML-fil fra Klangio.");
        }
        return await resultRes.text();
      }

      if (status === "FAILED" || status === "ERROR") {
        const errorMsg = String(statusData.errorMessage || statusData.error || "Klangio transskribering fejlede.");
        throw new Error(errorMsg);
      }
    }

    throw new Error("Klangio transskribering tog for lang tid (timeout).");
  }

  /**
   * Sends audio to a self-hosted Spotify Basic Pitch API wrapper
   */
  private static async runBasicPitchTranscription(
    base64Data: string,
    mimeType: string,
    apiUrl: string,
    logs: string[]
  ): Promise<string> {
    logs.push(`Kontakter Basic Pitch API på ${apiUrl}...`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        audio: base64Data,
        mimeType: mimeType,
        quantize: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Basic Pitch API returnerede fejl: ${response.status} - ${errText}`);
    }

    const result = await response.json() as { xml?: string };
    if (!result.xml) {
      throw new Error("Basic Pitch returnerede intet gyldigt MusicXML output.");
    }
    
    return result.xml;
  }

  /**
   * Returns a standard curated demonstration transcription with transparent logs
   */
  private static async runLocalMockTranscription(
    youtubeUrl: string | undefined,
    fileName: string | undefined,
    logs: string[]
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push("Genererer eksempelnode i 4/4 standard groove (104 BPM)...");
    logs.push("Status: Demo-output indlæst til afprøvning.");

    const sourceName = youtubeUrl 
      ? "YouTube Transskription (Demo)" 
      : `Demo: ${fileName || "Trommeøvelse"}`;
    
    return getStandardDrumMusicXML(sourceName, 104, "standard");
  }
}
