import { INode } from "../../types";

/**
 * Print a count and a pluralised word
 * @param count
 * @param word
 * @param plural
 */
export function plural(count: number, word: string, plural: string = null): string {
  if (count === 1) return `1 ${word}`;
  if (plural) return `${count} ${plural}`;

  return `${count} ${word}s`;
}

/**
 * Convert an array of objects to an object using keys from the items
 * @param key
 * @param array
 */
export function keyBy<T>(key: string, array: Array<T>): { [key: string]: T } {
  if (!array) return {};

  const map: any = {};
  array.forEach((item: any) => {
    map[item[key]] = item;
  });

  return map;
}

/**
 * Sort an array by a key. Returns a new array
 * @param key
 * @param array
 */
export function sortBy(key: string, array: Array<any>) {
  return [...array].sort((a: any, b: any) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
}

/**
 * Find anything in nodes that has a nextNodeId pointing to node
 * @param targetNode
 * @param nodes
 */
export function findLinksToNode(targetNode: INode, nodes: Array<INode>): Array<string> {
  if (!targetNode || !nodes) return [];

  return nodes.reduce((links, node) => {
    const lines = node.lines.filter(o => o.goToNodeId === targetNode.id).map(o => o.id);
    const responses = node.responses.filter(o => o.goToNodeId === targetNode.id).map(o => o.id);

    return links.concat(lines, responses);
  }, []);
}

/**
 * Get a list of everything that links out of a node
 * @param node
 */
export function findLinksFromNode(node: INode): Array<{ fromId: string; toId: string }> {
  if (!node) return [];

  return node.lines
    .concat(node.responses)
    .filter(l => l.goToNodeId)
    .map(item => ({
      fromId: item.id,
      toId: item.goToNodeId
    }));
}

/**
 * Filter a list of nodes and return a new list with only found nodes
 * @param filter
 * @param nodes
 */
export function filterNodes(filter: string, nodes: Array<INode>): Array<INode> {
  if (!nodes) return [];

  const f = filter.toLowerCase();
  return nodes.filter(node => {
    // Slug
    if (node.name.toLowerCase().includes(f)) return true;

    // Lines
    if (
      node.lines.find(line => {
        if (line.character?.toLowerCase().includes(f)) return true;
        if (line.dialogue?.toLowerCase().includes(f)) return true;
        if (line.condition?.toLowerCase().includes(f)) return true;
        if (line.mutation?.toLowerCase().includes(f)) return true;
        if (line.goToNodeName?.toLowerCase().includes(f)) return true;
        return false;
      })
    )
      return true;

    // Responses
    if (
      node.responses.find(response => {
        if (response.condition?.toLowerCase().includes(f)) return true;
        if (response.prompt?.toLowerCase().includes(f)) return true;
        if (response.goToNodeName.toLowerCase().includes(f)) return true;
        return false;
      })
    )
      return true;

    // No match
    return false;
  });
}

/**
 * Get a hash of every line/response id that points to its node
 * @param nodes
 */
export function getNodesByChildId(nodes: Array<INode>): { [id: string]: INode } {
  if (!nodes) return {};

  const list = {};
  nodes.forEach(node => {
    node.lines.forEach(line => {
      list[line.id] = node;
    });
    node.responses.forEach(response => {
      list[response.id] = node;
    });
  });

  return list;
}

export function copyToClipboard(s: string) {
  const input = document.createElement("input");
  input.style.setProperty("position", "absolute");
  input.style.setProperty("opacity", "0.01");
  document.body.appendChild(input);
  input.value = s;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}
