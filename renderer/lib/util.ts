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
export function keyBy<T>(key: string, array: T[]): { [key: string]: T } {
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
export function sortBy(key: string, array: any[]) {
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
export function findLinksToNode(targetNode: INode, nodes: INode[]): string[] {
  if (!targetNode || !nodes) return [];

  return nodes.reduce((links, node) => {
    return links.concat(node.options.filter(o => o.nextNodeId === targetNode.id).map(o => o.id));
  }, []);
}

/**
 * Filter a list of nodes and return a new list with only found nodes
 * @param filter
 * @param nodes
 */
export function filterNodes(filter: string, nodes: INode[]): INode[] {
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
        return false;
      })
    )
      return true;

    // Options
    if (
      node.options.find(option => {
        if (option.condition?.toLowerCase().includes(f)) return true;
        if (option.prompt?.toLowerCase().includes(f)) return true;
        if (option.nextNodeName.toLowerCase().includes(f)) return true;
        return false;
      })
    )
      return true;

    // No match
    return false;
  });
}

/**
 * Get a hash of every option id that points to its node
 * @param nodes
 */
export function getNodesByOptionId(nodes: INode[]): { [id: string]: INode } {
  if (!nodes) return {};

  const list = {};
  nodes.forEach(node => {
    node.options.forEach(option => {
      list[option.id] = node;
    });
  });

  return list;
}
