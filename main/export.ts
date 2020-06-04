import { keyBy } from "../renderer/lib/util";

import { INode, ISequence, IProject, INodeLine } from "../types";

/**
 * Convert a list of nodes to XML
 * @param nodes
 */
export function projectToXml(project: IProject): string {
  const xml = project.sequences
    .map(sequence => {
      const nodesById = keyBy("id", sequence.nodes);
      const sequenceXml = sequence.nodes
        .map(node => {
          let entryPoint = node.name;

          const lines = node.lines
            .filter(l => l.dialogue !== "")
            .map((line, index, arr) => {
              const type = line.mutation ? "mutation" : "dialogue";
              const nextNodeId = index === arr.length - 1 ? node.options[0]?.id || "" : arr[index + 1].id;
              const children =
                type === "mutation"
                  ? `<mutation do="${line.mutation}" nextNodeId="${nextNodeId}" />`
                  : `<dialogue
                      ${line.condition ? `if="${line.condition}"` : ""}
                      character="${line.character}"
                      nextNodeId="${nextNodeId}">
                      ${line.dialogue}
                    </dialogue>`;

              // The Node's name can only be uses once
              const id = entryPoint ? entryPoint : line.id;
              entryPoint = null;

              return `<node id="${id}" type="${type}">${children}</node>`;
            })
            .join("");

          let options = "";
          if (node.options.length > 0) {
            options = `
              <node id="${entryPoint ? entryPoint : node.options[0].id}" type="options">
                  <options>
                    ${node.options
                      .map(option => {
                        const nextNode = nodesById[option.nextNodeId];
                        const nextNodeId = nextNode ? nextNode.name : "";
                        return `<option 
                                  ${option.condition ? `if="${option.condition}"` : ""} 
                                  nextNodeId="${nextNodeId}">
                                  ${option.prompt}
                                </option>`;
                      })
                      .join("")}
                  </options>
                </node>`;
          }

          // Add to the xml output
          return lines + options;
        })
        .join("");

      return `<sequence id="${sequence.name}">${sequenceXml}</sequence>`;
    })
    .join("");

  const XML_DEC = '<?xml version="1.0" encoding="UTF-8"?>\n';

  return `${XML_DEC}\n<sequences>${xml}</sequences>`;
}

interface IExportedNode {
  id?: string;
  type?: "dialogue" | "mutation" | "options";
  nextNodeId?: string;
  condition?: string;
  character?: string;
  dialogue?: string;
  mutation?: string;
  options?: Array<{
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
        id: sequence.name,
        nodes: keyBy(
          "id",
          sequence.nodes.reduce((nodes, node) => {
            let entryPoint = node.name;

            node.lines
              .filter(l => l.dialogue !== "")
              .forEach((line, index, arr) => {
                const exportedNode: IExportedNode = line;

                if (entryPoint) {
                  exportedNode.id = entryPoint;
                  entryPoint = null;
                }

                exportedNode.type = exportedNode.mutation ? "mutation" : "dialogue";
                exportedNode.nextNodeId = index === arr.length - 1 ? node.options[0]?.id || "" : arr[index + 1].id;
                nodes = nodes.concat(exportedNode);
              });

            if (node.options.length > 0) {
              const options: IExportedNode = {
                id: entryPoint ? entryPoint : node.options[0].id,
                type: "options",
                options: node.options.map(option => {
                  const nextNode = nodesById[option.nextNodeId];
                  return {
                    condition: option.condition,
                    prompt: option.prompt,
                    nextNodeId: nextNode ? nextNode.name : null
                  };
                })
              };

              nodes = nodes.concat(options);
            }

            return nodes;
          }, [])
        )
      };
    })
  );

  return JSON.stringify(exportedSequences);
}
