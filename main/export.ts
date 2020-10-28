import { keyBy } from "../renderer/lib/util";

import { IProject, INodeLine } from "../types";

const XML_DEC = '<?xml version="1.0" encoding="UTF-8"?>\n';

/**
 * Convert a list of nodes to XML
 * @param project
 */
export function projectToXml(project: IProject): string {
  const xml = project.sequences
    .map(sequence => {
      const nodesById = keyBy("id", sequence.nodes);
      const sequenceXml = sequence.nodes
        .map(node => {
          let entryPoint = node.id;

          const lines = node.lines
            .filter(l => l.dialogue !== "")
            .map((line, index, arr) => {
              const type = getType(line);
              const nextNodeId = index === arr.length - 1 ? node.responses[0]?.id || "" : arr[index + 1].id;

              let children = "";
              switch (type) {
                case "mutation":
                  children = `<mutation do="${line.mutation}" nextNodeId="${nextNodeId}" />`;
                  break;

                case "goto":
                  children = `<goto if="${line.condition}" goToNodeId="${
                    nodesById[line.goToNodeId]?.id ?? ""
                  }" nextNodeId="${nextNodeId}" />`;
                  break;

                case "dialogue":
                  children = `<dialogue ${line.condition ? `if="${line.condition}"` : ""} character="${
                    line.character
                  }" nextNodeId="${nextNodeId}">${line.dialogue}</dialogue>`;
                  break;
              }

              // The Node's name can only be used once
              const id = entryPoint ? entryPoint : line.id;
              entryPoint = null;

              return `<node id="${id}" type="${type}">${children}</node>`;
            })
            .join("");

          let responses = "";
          if (node.responses.length > 0) {
            responses = `
              <node id="${entryPoint ? entryPoint : node.responses[0].id}" type="responses">
                  <responses>
                    ${node.responses
                      .map(response => {
                        const nextNodeId = nodesById[response.goToNodeId]?.id ?? "";
                        return `<response ${
                          response.condition ? `if="${response.condition}"` : ""
                        } nextNodeId="${nextNodeId}">${response.prompt}</response>`;
                      })
                      .join("")}
                  </responses>
                </node>`;
          }

          // Add to the xml output
          return lines + responses;
        })
        .join("");

      return `<sequence id="${sequence.id}">${sequenceXml}</sequence>`;
    })
    .join("");

  return `${XML_DEC}\n<sequences>${xml}</sequences>`;
}

interface IResXData {
  name: string;
  value: string;
  comment: string;
}

/**
 * Extract all printable text into translatable lines
 * @param project
 */
export function projectToResx(project: IProject) {
  const characterNames: Array<string> = [];

  const data: Array<IResXData> = project.sequences.reduce((strings: Array<IResXData>, sequence) => {
    sequence.nodes.forEach(node => {
      node.lines.forEach(line => {
        if (line.character && !characterNames.includes(line.character)) {
          characterNames.push(line.character);
          strings = strings.concat({
            name: line.character,
            value: line.character,
            comment: "Character name"
          });
        }

        if (line.dialogue) {
          strings = strings.concat({
            name: line.id,
            value: line.dialogue,
            comment: `${sequence.name} (${sequence.id} / ${node.id})`
          });
        }
      });
    });

    return strings;
  }, []);

  return `${XML_DEC}\n
    <root>
      <resheader name="resmimetype">
          <value>text/microsoft-resx</value>
      </resheader>
      <resheader name="version">
          <value>2.0</value>
      </resheader>
      <resheader name="reader">
          <value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
      </resheader>
      <resheader name="writer">
          <value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
      </resheader>
      ${data
        .map(d => `<data name="${d.name}"><value>${d.value}</value><comment>${d.comment}</comment></data>\n`)
        .join("")}
    </root>`;
}

interface IExportedNode {
  id: string;
  type?: "dialogue" | "mutation" | "goto" | "responses";
  nextNodeId?: string;
  condition?: string;
  character?: string;
  dialogue?: string;
  mutation?: string;
  gotoNodeId?: string;
  responses?: Array<{
    condition?: string;
    prompt?: string;
    nextNodeId?: string;
  }>;
}

export function projectToJson(project: IProject): string {
  const exportedSequences = keyBy(
    "id",
    project.sequences.map(sequence => {
      const nodesById = keyBy("id", sequence.nodes);

      return {
        id: sequence.id,
        nodes: keyBy(
          "id",
          sequence.nodes.reduce((nodes, node) => {
            let entryPoint = node.id;

            node.lines
              .filter(l => l.dialogue !== "")
              .forEach((line, index, arr) => {
                const exportedNode: IExportedNode = {
                  id: line.id,
                  type: getType(line),
                  condition: line.condition,
                  character: line.character,
                  dialogue: line.dialogue,
                  mutation: line.mutation,
                  gotoNodeId: line.goToNodeId,
                  nextNodeId: index === arr.length - 1 ? node.responses[0]?.id || "" : arr[index + 1].id
                };

                if (entryPoint) {
                  exportedNode.id = entryPoint;
                  entryPoint = null;
                }

                nodes = nodes.concat(exportedNode);
              });

            if (node.responses.length > 0) {
              const responses: IExportedNode = {
                id: entryPoint ? entryPoint : node.responses[0].id,
                type: "responses",
                responses: node.responses.map(response => {
                  const nextNode = nodesById[response.goToNodeId];
                  return {
                    condition: response.condition,
                    prompt: response.prompt,
                    nextNodeId: nextNode ? nextNode.id : null
                  };
                })
              };

              nodes = nodes.concat(responses);
            }

            return nodes;
          }, [])
        )
      };
    })
  );

  return JSON.stringify(exportedSequences);
}

interface IGodotLine {
  id: string;
  type?: "dialogue" | "mutation" | "goto" | "responses";
  next_node_id?: string;
  condition?: string;
  character?: string;
  dialogue?: string;
  mutation?: string;
  go_to_node_id?: string;
  responses?: Array<{
    condition?: string;
    prompt?: string;
    next_node_id?: string;
  }>;
}

/**
 * Export a project into a Godot Resource
 * @param project
 */
export function projectToTres(project: IProject): string {
  const list = keyBy("id", projectToExportNodesList(project));

  return `[gd_resource type="Resource" load_steps=2 format=2]

[ext_resource path="res://addons/saywhat_godot/dialogue_resource.gd" type="Script" id=1]

[resource]
script = ExtResource( 1 )
lines = ${JSON.stringify(list)}`;
}

export function projectToExportNodesList(project: IProject): Array<IGodotLine> {
  return project.sequences.reduce((list, sequence) => {
    const nodesById = keyBy("id", sequence.nodes);

    return list.concat(
      sequence.nodes.reduce((nodes, node) => {
        let entryPoint = node.id;

        node.lines
          .filter(l => l.dialogue !== "")
          .forEach((line, index, arr) => {
            const exportedNode: IGodotLine = {
              id: line.id,
              type: getType(line),
              condition: line.condition,
              character: line.character,
              dialogue: line.dialogue,
              mutation: line.mutation,
              go_to_node_id: line.goToNodeId ?? "",
              next_node_id: index === arr.length - 1 ? node.responses[0]?.id || "" : arr[index + 1].id
            };

            if (entryPoint) {
              exportedNode.id = entryPoint;
              entryPoint = null;
            }

            nodes = nodes.concat(exportedNode);
          });

        if (node.responses.length > 0) {
          const responses: IGodotLine = {
            id: entryPoint ? entryPoint : node.responses[0].id,
            type: "responses",
            responses: node.responses.map(response => {
              const nextNode = nodesById[response.goToNodeId];
              return {
                condition: response.condition,
                prompt: response.prompt,
                next_node_id: nextNode ? nextNode.id : ""
              };
            })
          };

          nodes = nodes.concat(responses);
        }

        return nodes;
      }, [])
    );
  }, []);
}

type INodeLineType = "mutation" | "goto" | "dialogue";

/**
 * Get the type of a line
 * @param line
 */
export function getType(line: INodeLine): INodeLineType {
  if (line.goToNodeName) return "goto";
  if (line.mutation) return "mutation";
  if (line.goToNodeId) return "goto";
  return "dialogue";
}
