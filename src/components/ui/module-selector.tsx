import { Module } from "@/lib/roles/types/roles.types";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { ScrollArea } from "./scroll-area";

interface Props {
  value: string[];
  onChange: (modules: string[]) => void;
  options: Module[];
  height: string;
}

export function ModuleSelector({ value, onChange, options, height }: Props) {
  const isModuleSelected = (module: Module) =>
    module.actions?.every((action) => value.includes(action.name));

  const isModuleIndeterminate = (module: Module) =>
    module.actions?.some((action) => value.includes(action.name)) &&
    !isModuleSelected(module);

  const handleModuleChange = (
    actionName: string,
    isChecked: boolean,
    module?: Module
  ) => {
    let newSelected: string[];

    if (module) {
      if (isChecked) {
        const actionsToAdd = (module.actions || [])
          .map((action) => action.name)
          .filter((name) => !value.includes(name));
        newSelected = [...value, ...actionsToAdd];
      } else {
        newSelected = value.filter(
          (name) =>
            !(module.actions || []).some((action) => action.name === name)
        );
      }
    } else {
      if (isChecked) {
        newSelected = [...value, actionName];
      } else {
        newSelected = value.filter((name) => name !== actionName);
      }
    }

    onChange(newSelected);
  };

  return (
    <ScrollArea className={cn("w-full rounded-md border p-4", `h-[${height}]`)}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {options.map((module) => (
            <Card key={module.subject} className="w-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={module.subject}
                      checked={isModuleSelected(module)}
                      onCheckedChange={(checked) =>
                        handleModuleChange("", checked as boolean, module)
                      }
                      className={cn(
                        isModuleIndeterminate(module) && "bg-primary/50"
                      )}
                    />
                    <Label
                      htmlFor={module.subject}
                      className="flex cursor-pointer flex-col"
                    >
                      <span>{module.subject}</span>
                      <span className="text-xs text-muted-foreground">
                        {module.description}
                      </span>
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {module.actions?.map((action) => (
                    <div
                      key={action.name}
                      className="ml-4 flex items-center space-x-2"
                    >
                      <Checkbox
                        id={action.name}
                        checked={value.includes(action.name)}
                        onCheckedChange={(checked) =>
                          handleModuleChange(action.name, checked as boolean)
                        }
                      />

                      <Label
                        htmlFor={action.name}
                        className="flex cursor-pointer flex-col text-sm"
                      >
                        <span className="capitalize">
                          {action.name.split(":")[1]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {action.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
