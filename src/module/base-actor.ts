export class SWNRBaseActor<
  Type extends Actor["type"] = Actor["type"]
> extends Actor {
  // @ts-expect-error Subtype override
  data: Actor["data"] & { _source: { type: Type }; type: Type };
}
