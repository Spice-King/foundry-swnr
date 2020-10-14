export default function proxy(
  entities: Record<string, typeof Entity>,
  baseClass: typeof Entity
) : unknown {
  return new Proxy(baseClass, {
    construct: function (target, args) {
      const [data, options] = args;
      const constructor = entities[data.type];

      if (!constructor) {
        throw new Error("Unsupported Entity type for create(): " + data.type);
      }
      return new constructor(data, options);
    },
    get: function (target, prop) {
      switch (prop) {
        case "create":
          //Calling the class' create() static function
          return function (data: EntityData, options: unknown) {
            const constructor = entities[data.type];

            if (!constructor) {
              throw new Error(
                "Unsupported Entity type for create(): " + data.type
              );
            }
            return new constructor(data, options);
          };

        case Symbol.hasInstance:
          //Applying the "instanceof" operator on the instance object
          return function (instance: Entity) {
            const constr = entities[instance.data.type];
            if (!constr) {
              return false;
            }
            return instance instanceof constr;
          };
        default:
          //Just forward any requested properties to the base Actor class
          return baseClass[prop];
      }
    },
  });
}
