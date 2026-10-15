import { Output, simulateReadableStream, streamText } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { z } from 'zod';

async function main() {
  const key = 'key":true,"other';
  const encodedKey = JSON.stringify(key);
  const result = streamText({
    model: new MockLanguageModelV4({
      doStream: {
        stream: simulateReadableStream({
          chunks: [
            { type: 'stream-start', warnings: [] },
            { type: 'text-start', id: 'text-0' },
            { type: 'text-delta', id: 'text-0', delta: `{${encodedKey}:"hel` },
            { type: 'text-delta', id: 'text-0', delta: 'lo"}' },
            { type: 'text-end', id: 'text-0' },
            {
              type: 'finish',
              finishReason: { unified: 'stop', raw: undefined },
              usage: {
                inputTokens: {
                  total: 0,
                  noCache: 0,
                  cacheRead: undefined,
                  cacheWrite: undefined,
                },
                outputTokens: { total: 0, text: 0, reasoning: undefined },
              },
            },
          ],
          initialDelayInMs: null,
          chunkDelayInMs: null,
        }),
      },
    }),
    output: Output.object({ schema: z.object({ [key]: z.string() }) }),
    prompt: 'Return an object containing the requested key.',
  });

  // The partial output should include "hel", before the final "hello" arrives.
  for await (const partial of result.partialOutputStream) {
    console.log(partial);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
