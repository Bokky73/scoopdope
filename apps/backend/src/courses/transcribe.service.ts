import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import axios from 'axios';

@Injectable()
export class TranscribeService {
  private transcribeClient: TranscribeClient;
  private readonly logger = new Logger(TranscribeService.name);

  constructor(private configService: ConfigService) {
    this.transcribeClient = new TranscribeClient({
      region: this.configService.get<string>('aws.region') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId') ?? '',
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey') ?? '',
      },
    });
  }

  async startTranscription(lessonId: string, videoUrl: string) {
    const jobName = `lesson-${lessonId}-${Date.now()}`;
    
    try {
      // Note: AWS Transcribe requires the media file to be in S3 for StartTranscriptionJobCommand
      // If videoUrl is not an S3 URI, this might need adjustment (e.g., uploading to S3 first)
      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        Media: { MediaFileUri: videoUrl },
        LanguageCode: 'en-US',
      });

      await this.transcribeClient.send(command);
      return jobName;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start transcription for lesson ${lessonId}: ${message}`);
      throw error;
    }
  }

  async getTranscriptionResult(jobName: string) {
    try {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      });

      const response = await this.transcribeClient.send(command);
      const status = response.TranscriptionJob?.TranscriptionJobStatus;

      if (status === 'COMPLETED') {
        const transcriptUrl = response.TranscriptionJob?.Transcript?.TranscriptFileUri;
        if (transcriptUrl) {
          const { data } = await axios.get(transcriptUrl);
          return data;
        }
      } else if (status === 'FAILED') {
        this.logger.error(`Transcription job ${jobName} failed: ${response.TranscriptionJob?.FailureReason}`);
        return null;
      }

      return status;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get transcription result for ${jobName}: ${message}`);
      throw error;
    }
  }

  convertToSrt(transcriptJson: any): string {
    if (!transcriptJson?.results?.items) return '';

    const items = transcriptJson.results.items;
    let srt = '';
    let counter = 1;
    let currentSentence: string[] = [];
    let startTime = '';

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'pronunciation') {
        if (!startTime) startTime = item.start_time;
        currentSentence.push(item.alternatives[0].content);
      } else if (item.type === 'punctuation') {
        if (currentSentence.length > 0) {
          currentSentence[currentSentence.length - 1] += item.alternatives[0].content;
        }
        
        const content = item.alternatives[0].content;
        if (content === '.' || content === '?' || content === '!') {
          const endTime = items[i - 1]?.end_time || items[i]?.end_time;
          srt += `${counter}\n`;
          srt += `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`;
          srt += `${currentSentence.join(' ')}\n\n`;
          
          counter++;
          currentSentence = [];
          startTime = '';
        }
      }
    }

    // Handle remaining sentence if it doesn't end with punctuation
    if (currentSentence.length > 0) {
      const endTime = items[items.length - 1]?.end_time;
      srt += `${counter}\n`;
      srt += `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`;
      srt += `${currentSentence.join(' ')}\n\n`;
    }

    return srt;
  }

  private formatTime(secondsStr: string): string {
    if (!secondsStr) return '00:00:00,000';
    const totalSeconds = parseFloat(secondsStr);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  }

  generateTranscriptPdf(lesson: any): Buffer {
    const title = `Transcript: ${lesson.title}`;
    const transcript = lesson.transcript?.results?.transcripts?.[0]?.transcript || '';
    
    // Split transcript into lines for PDF
    const words = transcript.split(' ');
    const lines = [];
    let currentLine = [];
    
    for (const word of words) {
      currentLine.push(word);
      if (currentLine.length > 10) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
    }
    if (currentLine.length > 0) lines.push(currentLine.join(' '));

    const pdfLines = [
      { size: 20, x: 50, y: 730, text: title },
      ...lines.slice(0, 30).map((text, i) => ({
        size: 10,
        x: 50,
        y: 680 - i * 15,
        text
      }))
    ];

    const stream = [
      'BT',
      ...pdfLines.map(
        ({ size, x, y, text }) =>
          `BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${this.escapePdfText(text)}) Tj ET`
      ),
      'ET',
    ].join('\n');

    return this.buildPdf(stream);
  }

  private buildPdf(content: string) {
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
      `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    for (const object of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${object}\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';

    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }

  private escapePdfText(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
}
