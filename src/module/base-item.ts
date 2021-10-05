export class SWNRBaseItem<
  Type extends Item["type"] = Item["type"]
> extends Item {
  // @ts-expect-error Subtype override
  data: Item["data"] & { _source: { type: Type }; type: Type };
}
