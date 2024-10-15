import { z } from "zod";

export type CallbackParameters = {
  code: string;
  state: string;
};

const callbackParametersSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export function parseCallbackParameters(
  params: CallbackParameters,
  expectedState: string
): CallbackParameters {
  return callbackParametersSchema
    .refine(({ state }) => state === expectedState)
    .parse(params);
}
