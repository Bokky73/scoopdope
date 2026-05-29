// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import axios from 'axios';
@Injectable()
export class TranscribeService {
  private transcribeClient: TranscribeClient;
  private readonly logger = new Logger(TranscribeService.name);
  constructor(private configService: ConfigService) {
    if (stryMutAct_9fa48("2991")) {
      {}
    } else {
      stryCov_9fa48("2991");
      this.transcribeClient = new TranscribeClient(stryMutAct_9fa48("2992") ? {} : (stryCov_9fa48("2992"), {
        region: this.configService.get(stryMutAct_9fa48("2993") ? "" : (stryCov_9fa48("2993"), 'aws.region')),
        credentials: stryMutAct_9fa48("2994") ? {} : (stryCov_9fa48("2994"), {
          accessKeyId: this.configService.get(stryMutAct_9fa48("2995") ? "" : (stryCov_9fa48("2995"), 'aws.accessKeyId')),
          secretAccessKey: this.configService.get(stryMutAct_9fa48("2996") ? "" : (stryCov_9fa48("2996"), 'aws.secretAccessKey'))
        })
      }));
    }
  }
  async startTranscription(lessonId: string, videoUrl: string) {
    if (stryMutAct_9fa48("2997")) {
      {}
    } else {
      stryCov_9fa48("2997");
      const jobName = stryMutAct_9fa48("2998") ? `` : (stryCov_9fa48("2998"), `lesson-${lessonId}-${Date.now()}`);
      try {
        if (stryMutAct_9fa48("2999")) {
          {}
        } else {
          stryCov_9fa48("2999");
          // Note: AWS Transcribe requires the media file to be in S3 for StartTranscriptionJobCommand
          // If videoUrl is not an S3 URI, this might need adjustment (e.g., uploading to S3 first)
          const command = new StartTranscriptionJobCommand(stryMutAct_9fa48("3000") ? {} : (stryCov_9fa48("3000"), {
            TranscriptionJobName: jobName,
            Media: stryMutAct_9fa48("3001") ? {} : (stryCov_9fa48("3001"), {
              MediaFileUri: videoUrl
            }),
            LanguageCode: stryMutAct_9fa48("3002") ? "" : (stryCov_9fa48("3002"), 'en-US')
          }));
          await this.transcribeClient.send(command);
          return jobName;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3003")) {
          {}
        } else {
          stryCov_9fa48("3003");
          this.logger.error(stryMutAct_9fa48("3004") ? `` : (stryCov_9fa48("3004"), `Failed to start transcription for lesson ${lessonId}: ${error.message}`));
          throw error;
        }
      }
    }
  }
  async getTranscriptionResult(jobName: string) {
    if (stryMutAct_9fa48("3005")) {
      {}
    } else {
      stryCov_9fa48("3005");
      try {
        if (stryMutAct_9fa48("3006")) {
          {}
        } else {
          stryCov_9fa48("3006");
          const command = new GetTranscriptionJobCommand(stryMutAct_9fa48("3007") ? {} : (stryCov_9fa48("3007"), {
            TranscriptionJobName: jobName
          }));
          const response = await this.transcribeClient.send(command);
          const status = stryMutAct_9fa48("3008") ? response.TranscriptionJob.TranscriptionJobStatus : (stryCov_9fa48("3008"), response.TranscriptionJob?.TranscriptionJobStatus);
          if (stryMutAct_9fa48("3011") ? status !== 'COMPLETED' : stryMutAct_9fa48("3010") ? false : stryMutAct_9fa48("3009") ? true : (stryCov_9fa48("3009", "3010", "3011"), status === (stryMutAct_9fa48("3012") ? "" : (stryCov_9fa48("3012"), 'COMPLETED')))) {
            if (stryMutAct_9fa48("3013")) {
              {}
            } else {
              stryCov_9fa48("3013");
              const transcriptUrl = stryMutAct_9fa48("3015") ? response.TranscriptionJob.Transcript?.TranscriptFileUri : stryMutAct_9fa48("3014") ? response.TranscriptionJob?.Transcript.TranscriptFileUri : (stryCov_9fa48("3014", "3015"), response.TranscriptionJob?.Transcript?.TranscriptFileUri);
              if (stryMutAct_9fa48("3017") ? false : stryMutAct_9fa48("3016") ? true : (stryCov_9fa48("3016", "3017"), transcriptUrl)) {
                if (stryMutAct_9fa48("3018")) {
                  {}
                } else {
                  stryCov_9fa48("3018");
                  const {
                    data
                  } = await axios.get(transcriptUrl);
                  return data;
                }
              }
            }
          } else if (stryMutAct_9fa48("3021") ? status !== 'FAILED' : stryMutAct_9fa48("3020") ? false : stryMutAct_9fa48("3019") ? true : (stryCov_9fa48("3019", "3020", "3021"), status === (stryMutAct_9fa48("3022") ? "" : (stryCov_9fa48("3022"), 'FAILED')))) {
            if (stryMutAct_9fa48("3023")) {
              {}
            } else {
              stryCov_9fa48("3023");
              this.logger.error(stryMutAct_9fa48("3024") ? `` : (stryCov_9fa48("3024"), `Transcription job ${jobName} failed: ${stryMutAct_9fa48("3025") ? response.TranscriptionJob.FailureReason : (stryCov_9fa48("3025"), response.TranscriptionJob?.FailureReason)}`));
              return null;
            }
          }
          return status;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3026")) {
          {}
        } else {
          stryCov_9fa48("3026");
          this.logger.error(stryMutAct_9fa48("3027") ? `` : (stryCov_9fa48("3027"), `Failed to get transcription result for ${jobName}: ${error.message}`));
          throw error;
        }
      }
    }
  }
  convertToSrt(transcriptJson: any): string {
    if (stryMutAct_9fa48("3028")) {
      {}
    } else {
      stryCov_9fa48("3028");
      if (stryMutAct_9fa48("3031") ? false : stryMutAct_9fa48("3030") ? true : stryMutAct_9fa48("3029") ? transcriptJson?.results?.items : (stryCov_9fa48("3029", "3030", "3031"), !(stryMutAct_9fa48("3033") ? transcriptJson.results?.items : stryMutAct_9fa48("3032") ? transcriptJson?.results.items : (stryCov_9fa48("3032", "3033"), transcriptJson?.results?.items)))) return stryMutAct_9fa48("3034") ? "Stryker was here!" : (stryCov_9fa48("3034"), '');
      const items = transcriptJson.results.items;
      let srt = stryMutAct_9fa48("3035") ? "Stryker was here!" : (stryCov_9fa48("3035"), '');
      let counter = 1;
      let currentSentence: string[] = stryMutAct_9fa48("3036") ? ["Stryker was here"] : (stryCov_9fa48("3036"), []);
      let startTime = stryMutAct_9fa48("3037") ? "Stryker was here!" : (stryCov_9fa48("3037"), '');
      for (let i = 0; stryMutAct_9fa48("3040") ? i >= items.length : stryMutAct_9fa48("3039") ? i <= items.length : stryMutAct_9fa48("3038") ? false : (stryCov_9fa48("3038", "3039", "3040"), i < items.length); stryMutAct_9fa48("3041") ? i-- : (stryCov_9fa48("3041"), i++)) {
        if (stryMutAct_9fa48("3042")) {
          {}
        } else {
          stryCov_9fa48("3042");
          const item = items[i];
          if (stryMutAct_9fa48("3045") ? item.type !== 'pronunciation' : stryMutAct_9fa48("3044") ? false : stryMutAct_9fa48("3043") ? true : (stryCov_9fa48("3043", "3044", "3045"), item.type === (stryMutAct_9fa48("3046") ? "" : (stryCov_9fa48("3046"), 'pronunciation')))) {
            if (stryMutAct_9fa48("3047")) {
              {}
            } else {
              stryCov_9fa48("3047");
              if (stryMutAct_9fa48("3050") ? false : stryMutAct_9fa48("3049") ? true : stryMutAct_9fa48("3048") ? startTime : (stryCov_9fa48("3048", "3049", "3050"), !startTime)) startTime = item.start_time;
              currentSentence.push(item.alternatives[0].content);
            }
          } else if (stryMutAct_9fa48("3053") ? item.type !== 'punctuation' : stryMutAct_9fa48("3052") ? false : stryMutAct_9fa48("3051") ? true : (stryCov_9fa48("3051", "3052", "3053"), item.type === (stryMutAct_9fa48("3054") ? "" : (stryCov_9fa48("3054"), 'punctuation')))) {
            if (stryMutAct_9fa48("3055")) {
              {}
            } else {
              stryCov_9fa48("3055");
              if (stryMutAct_9fa48("3059") ? currentSentence.length <= 0 : stryMutAct_9fa48("3058") ? currentSentence.length >= 0 : stryMutAct_9fa48("3057") ? false : stryMutAct_9fa48("3056") ? true : (stryCov_9fa48("3056", "3057", "3058", "3059"), currentSentence.length > 0)) {
                if (stryMutAct_9fa48("3060")) {
                  {}
                } else {
                  stryCov_9fa48("3060");
                  stryMutAct_9fa48("3061") ? currentSentence[currentSentence.length - 1] -= item.alternatives[0].content : (stryCov_9fa48("3061"), currentSentence[stryMutAct_9fa48("3062") ? currentSentence.length + 1 : (stryCov_9fa48("3062"), currentSentence.length - 1)] += item.alternatives[0].content);
                }
              }
              const content = item.alternatives[0].content;
              if (stryMutAct_9fa48("3065") ? (content === '.' || content === '?') && content === '!' : stryMutAct_9fa48("3064") ? false : stryMutAct_9fa48("3063") ? true : (stryCov_9fa48("3063", "3064", "3065"), (stryMutAct_9fa48("3067") ? content === '.' && content === '?' : stryMutAct_9fa48("3066") ? false : (stryCov_9fa48("3066", "3067"), (stryMutAct_9fa48("3069") ? content !== '.' : stryMutAct_9fa48("3068") ? false : (stryCov_9fa48("3068", "3069"), content === (stryMutAct_9fa48("3070") ? "" : (stryCov_9fa48("3070"), '.')))) || (stryMutAct_9fa48("3072") ? content !== '?' : stryMutAct_9fa48("3071") ? false : (stryCov_9fa48("3071", "3072"), content === (stryMutAct_9fa48("3073") ? "" : (stryCov_9fa48("3073"), '?')))))) || (stryMutAct_9fa48("3075") ? content !== '!' : stryMutAct_9fa48("3074") ? false : (stryCov_9fa48("3074", "3075"), content === (stryMutAct_9fa48("3076") ? "" : (stryCov_9fa48("3076"), '!')))))) {
                if (stryMutAct_9fa48("3077")) {
                  {}
                } else {
                  stryCov_9fa48("3077");
                  const endTime = stryMutAct_9fa48("3080") ? items[i - 1]?.end_time && items[i]?.end_time : stryMutAct_9fa48("3079") ? false : stryMutAct_9fa48("3078") ? true : (stryCov_9fa48("3078", "3079", "3080"), (stryMutAct_9fa48("3081") ? items[i - 1].end_time : (stryCov_9fa48("3081"), items[stryMutAct_9fa48("3082") ? i + 1 : (stryCov_9fa48("3082"), i - 1)]?.end_time)) || (stryMutAct_9fa48("3083") ? items[i].end_time : (stryCov_9fa48("3083"), items[i]?.end_time)));
                  srt += stryMutAct_9fa48("3084") ? `` : (stryCov_9fa48("3084"), `${counter}\n`);
                  srt += stryMutAct_9fa48("3085") ? `` : (stryCov_9fa48("3085"), `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`);
                  srt += stryMutAct_9fa48("3086") ? `` : (stryCov_9fa48("3086"), `${currentSentence.join(stryMutAct_9fa48("3087") ? "" : (stryCov_9fa48("3087"), ' '))}\n\n`);
                  stryMutAct_9fa48("3088") ? counter-- : (stryCov_9fa48("3088"), counter++);
                  currentSentence = stryMutAct_9fa48("3089") ? ["Stryker was here"] : (stryCov_9fa48("3089"), []);
                  startTime = stryMutAct_9fa48("3090") ? "Stryker was here!" : (stryCov_9fa48("3090"), '');
                }
              }
            }
          }
        }
      }

      // Handle remaining sentence if it doesn't end with punctuation
      if (stryMutAct_9fa48("3094") ? currentSentence.length <= 0 : stryMutAct_9fa48("3093") ? currentSentence.length >= 0 : stryMutAct_9fa48("3092") ? false : stryMutAct_9fa48("3091") ? true : (stryCov_9fa48("3091", "3092", "3093", "3094"), currentSentence.length > 0)) {
        if (stryMutAct_9fa48("3095")) {
          {}
        } else {
          stryCov_9fa48("3095");
          const endTime = stryMutAct_9fa48("3096") ? items[items.length - 1].end_time : (stryCov_9fa48("3096"), items[stryMutAct_9fa48("3097") ? items.length + 1 : (stryCov_9fa48("3097"), items.length - 1)]?.end_time);
          srt += stryMutAct_9fa48("3098") ? `` : (stryCov_9fa48("3098"), `${counter}\n`);
          srt += stryMutAct_9fa48("3099") ? `` : (stryCov_9fa48("3099"), `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`);
          srt += stryMutAct_9fa48("3100") ? `` : (stryCov_9fa48("3100"), `${currentSentence.join(stryMutAct_9fa48("3101") ? "" : (stryCov_9fa48("3101"), ' '))}\n\n`);
        }
      }
      return srt;
    }
  }
  private formatTime(secondsStr: string): string {
    if (stryMutAct_9fa48("3102")) {
      {}
    } else {
      stryCov_9fa48("3102");
      if (stryMutAct_9fa48("3105") ? false : stryMutAct_9fa48("3104") ? true : stryMutAct_9fa48("3103") ? secondsStr : (stryCov_9fa48("3103", "3104", "3105"), !secondsStr)) return stryMutAct_9fa48("3106") ? "" : (stryCov_9fa48("3106"), '00:00:00,000');
      const totalSeconds = parseFloat(secondsStr);
      const hours = Math.floor(stryMutAct_9fa48("3107") ? totalSeconds * 3600 : (stryCov_9fa48("3107"), totalSeconds / 3600));
      const minutes = Math.floor(stryMutAct_9fa48("3108") ? totalSeconds % 3600 * 60 : (stryCov_9fa48("3108"), (stryMutAct_9fa48("3109") ? totalSeconds * 3600 : (stryCov_9fa48("3109"), totalSeconds % 3600)) / 60));
      const seconds = Math.floor(stryMutAct_9fa48("3110") ? totalSeconds * 60 : (stryCov_9fa48("3110"), totalSeconds % 60));
      const milliseconds = Math.floor(stryMutAct_9fa48("3111") ? totalSeconds % 1 / 1000 : (stryCov_9fa48("3111"), (stryMutAct_9fa48("3112") ? totalSeconds * 1 : (stryCov_9fa48("3112"), totalSeconds % 1)) * 1000));
      return stryMutAct_9fa48("3113") ? `` : (stryCov_9fa48("3113"), `${String(hours).padStart(2, stryMutAct_9fa48("3114") ? "" : (stryCov_9fa48("3114"), '0'))}:${String(minutes).padStart(2, stryMutAct_9fa48("3115") ? "" : (stryCov_9fa48("3115"), '0'))}:${String(seconds).padStart(2, stryMutAct_9fa48("3116") ? "" : (stryCov_9fa48("3116"), '0'))},${String(milliseconds).padStart(3, stryMutAct_9fa48("3117") ? "" : (stryCov_9fa48("3117"), '0'))}`);
    }
  }
  generateTranscriptPdf(lesson: any): Buffer {
    if (stryMutAct_9fa48("3118")) {
      {}
    } else {
      stryCov_9fa48("3118");
      const title = stryMutAct_9fa48("3119") ? `` : (stryCov_9fa48("3119"), `Transcript: ${lesson.title}`);
      const transcript = stryMutAct_9fa48("3122") ? lesson.transcript?.results?.transcripts?.[0]?.transcript && '' : stryMutAct_9fa48("3121") ? false : stryMutAct_9fa48("3120") ? true : (stryCov_9fa48("3120", "3121", "3122"), (stryMutAct_9fa48("3126") ? lesson.transcript.results?.transcripts?.[0]?.transcript : stryMutAct_9fa48("3125") ? lesson.transcript?.results.transcripts?.[0]?.transcript : stryMutAct_9fa48("3124") ? lesson.transcript?.results?.transcripts[0]?.transcript : stryMutAct_9fa48("3123") ? lesson.transcript?.results?.transcripts?.[0].transcript : (stryCov_9fa48("3123", "3124", "3125", "3126"), lesson.transcript?.results?.transcripts?.[0]?.transcript)) || (stryMutAct_9fa48("3127") ? "Stryker was here!" : (stryCov_9fa48("3127"), '')));

      // Split transcript into lines for PDF
      const words = transcript.split(stryMutAct_9fa48("3128") ? "" : (stryCov_9fa48("3128"), ' '));
      const lines = stryMutAct_9fa48("3129") ? ["Stryker was here"] : (stryCov_9fa48("3129"), []);
      let currentLine = stryMutAct_9fa48("3130") ? ["Stryker was here"] : (stryCov_9fa48("3130"), []);
      for (const word of words) {
        if (stryMutAct_9fa48("3131")) {
          {}
        } else {
          stryCov_9fa48("3131");
          currentLine.push(word);
          if (stryMutAct_9fa48("3135") ? currentLine.length <= 10 : stryMutAct_9fa48("3134") ? currentLine.length >= 10 : stryMutAct_9fa48("3133") ? false : stryMutAct_9fa48("3132") ? true : (stryCov_9fa48("3132", "3133", "3134", "3135"), currentLine.length > 10)) {
            if (stryMutAct_9fa48("3136")) {
              {}
            } else {
              stryCov_9fa48("3136");
              lines.push(currentLine.join(stryMutAct_9fa48("3137") ? "" : (stryCov_9fa48("3137"), ' ')));
              currentLine = stryMutAct_9fa48("3138") ? ["Stryker was here"] : (stryCov_9fa48("3138"), []);
            }
          }
        }
      }
      if (stryMutAct_9fa48("3142") ? currentLine.length <= 0 : stryMutAct_9fa48("3141") ? currentLine.length >= 0 : stryMutAct_9fa48("3140") ? false : stryMutAct_9fa48("3139") ? true : (stryCov_9fa48("3139", "3140", "3141", "3142"), currentLine.length > 0)) lines.push(currentLine.join(stryMutAct_9fa48("3143") ? "" : (stryCov_9fa48("3143"), ' ')));
      const pdfLines = stryMutAct_9fa48("3144") ? [] : (stryCov_9fa48("3144"), [stryMutAct_9fa48("3145") ? {} : (stryCov_9fa48("3145"), {
        size: 20,
        x: 50,
        y: 730,
        text: title
      }), ...(stryMutAct_9fa48("3146") ? lines.map((text, i) => ({
        size: 10,
        x: 50,
        y: 680 - i * 15,
        text
      })) : (stryCov_9fa48("3146"), lines.slice(0, 30).map(stryMutAct_9fa48("3147") ? () => undefined : (stryCov_9fa48("3147"), (text, i) => stryMutAct_9fa48("3148") ? {} : (stryCov_9fa48("3148"), {
        size: 10,
        x: 50,
        y: stryMutAct_9fa48("3149") ? 680 + i * 15 : (stryCov_9fa48("3149"), 680 - (stryMutAct_9fa48("3150") ? i / 15 : (stryCov_9fa48("3150"), i * 15))),
        text
      })))))]);
      const stream = (stryMutAct_9fa48("3151") ? [] : (stryCov_9fa48("3151"), [stryMutAct_9fa48("3152") ? "" : (stryCov_9fa48("3152"), 'BT'), ...pdfLines.map(stryMutAct_9fa48("3153") ? () => undefined : (stryCov_9fa48("3153"), ({
        size,
        x,
        y,
        text
      }) => stryMutAct_9fa48("3154") ? `` : (stryCov_9fa48("3154"), `BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${this.escapePdfText(text)}) Tj ET`))), stryMutAct_9fa48("3155") ? "" : (stryCov_9fa48("3155"), 'ET')])).join(stryMutAct_9fa48("3156") ? "" : (stryCov_9fa48("3156"), '\n'));
      return this.buildPdf(stream);
    }
  }
  private buildPdf(content: string) {
    if (stryMutAct_9fa48("3157")) {
      {}
    } else {
      stryCov_9fa48("3157");
      const objects = stryMutAct_9fa48("3158") ? [] : (stryCov_9fa48("3158"), [stryMutAct_9fa48("3159") ? "" : (stryCov_9fa48("3159"), '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj'), stryMutAct_9fa48("3160") ? "" : (stryCov_9fa48("3160"), '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj'), stryMutAct_9fa48("3161") ? "" : (stryCov_9fa48("3161"), '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj'), stryMutAct_9fa48("3162") ? "" : (stryCov_9fa48("3162"), '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'), stryMutAct_9fa48("3163") ? `` : (stryCov_9fa48("3163"), `5 0 obj\n<< /Length ${Buffer.byteLength(content, stryMutAct_9fa48("3164") ? "" : (stryCov_9fa48("3164"), 'utf8'))} >>\nstream\n${content}\nendstream\nendobj`)]);
      let pdf = stryMutAct_9fa48("3165") ? "" : (stryCov_9fa48("3165"), '%PDF-1.4\n');
      const offsets = stryMutAct_9fa48("3166") ? [] : (stryCov_9fa48("3166"), [0]);
      for (const object of objects) {
        if (stryMutAct_9fa48("3167")) {
          {}
        } else {
          stryCov_9fa48("3167");
          offsets.push(Buffer.byteLength(pdf, stryMutAct_9fa48("3168") ? "" : (stryCov_9fa48("3168"), 'utf8')));
          pdf += stryMutAct_9fa48("3169") ? `` : (stryCov_9fa48("3169"), `${object}\n`);
        }
      }
      const xrefOffset = Buffer.byteLength(pdf, stryMutAct_9fa48("3170") ? "" : (stryCov_9fa48("3170"), 'utf8'));
      pdf += stryMutAct_9fa48("3171") ? `` : (stryCov_9fa48("3171"), `xref\n0 ${stryMutAct_9fa48("3172") ? objects.length - 1 : (stryCov_9fa48("3172"), objects.length + 1)}\n`);
      pdf += stryMutAct_9fa48("3173") ? "" : (stryCov_9fa48("3173"), '0000000000 65535 f \n');
      for (let index = 1; stryMutAct_9fa48("3176") ? index >= offsets.length : stryMutAct_9fa48("3175") ? index <= offsets.length : stryMutAct_9fa48("3174") ? false : (stryCov_9fa48("3174", "3175", "3176"), index < offsets.length); stryMutAct_9fa48("3177") ? index -= 1 : (stryCov_9fa48("3177"), index += 1)) {
        if (stryMutAct_9fa48("3178")) {
          {}
        } else {
          stryCov_9fa48("3178");
          pdf += stryMutAct_9fa48("3179") ? `` : (stryCov_9fa48("3179"), `${offsets[index].toString().padStart(10, stryMutAct_9fa48("3180") ? "" : (stryCov_9fa48("3180"), '0'))} 00000 n \n`);
        }
      }
      pdf += stryMutAct_9fa48("3181") ? `` : (stryCov_9fa48("3181"), `trailer\n<< /Size ${stryMutAct_9fa48("3182") ? objects.length - 1 : (stryCov_9fa48("3182"), objects.length + 1)} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
      return Buffer.from(pdf, stryMutAct_9fa48("3183") ? "" : (stryCov_9fa48("3183"), 'utf8'));
    }
  }
  private escapePdfText(value: string) {
    if (stryMutAct_9fa48("3184")) {
      {}
    } else {
      stryCov_9fa48("3184");
      return value.replace(/\\/g, stryMutAct_9fa48("3185") ? "" : (stryCov_9fa48("3185"), '\\\\')).replace(/\(/g, stryMutAct_9fa48("3186") ? "" : (stryCov_9fa48("3186"), '\\(')).replace(/\)/g, stryMutAct_9fa48("3187") ? "" : (stryCov_9fa48("3187"), '\\)'));
    }
  }
}