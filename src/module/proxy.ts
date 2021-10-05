import { SWNRBaseActor } from "./base-actor";
import { SWNRBaseItem } from "./base-item";

export default function proxy<
  Type extends typeof SWNRBaseItem | typeof SWNRBaseActor
>(
  entities: Record<string, Type>,
  baseClass: ReturnType<typeof ClientDocumentMixin>
): unknown {
  return new Proxy(baseClass, {
    construct: function (target, args: ConstructorParameters<Type>) {
      const [data] = args;
      if (!data) throw new Error();
      const constructor = entities[data.type];
      if (!constructor) {
        throw new Error("Unsupported Document type for create(): " + data.type);
      }
      return new (constructor.bind.apply(constructor))(...args);
    },
    get: function (target, prop) {
      switch (prop) {
        case "create":
          // Calling the class' create() static function
          return function (
            data: ConstructorParameters<Type>[0],
            options: ConstructorParameters<Type>[1]
          ) {
            const entitiesData = data instanceof Array ? data : [data];
            const results = entitiesData.map((data) => {
              const constructor = entities[data.type];

              if (!constructor) {
                console.log({ target, prop, data, options });

                throw new Error(
                  "Unsupported Document type for create(): " + data.type
                );
              }
              return constructor.create(data, <never>options);
            });
            return entitiesData.length === 1 ? results[0] : results;
          };

        case Symbol.hasInstance:
          // Applying the "instanceof" operator on the instance object
          return function (instance: InstanceType<Type>) {
            const constr = entities[instance.type];
            if (!constr) {
              return false;
            }
            return instance instanceof constr;
          };
        default:
          // Just forward any requested properties to the base Actor class
          return baseClass[prop];
      }
    },
  });
}
