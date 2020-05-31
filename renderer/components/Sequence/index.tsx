import { useState, useEffect } from "react";
import Head from "next/head";

import { Panel, Header, Section, Spacer } from "../Layout";
import { filterNodes } from "../../lib/util";
import useApplication from "../../hooks/useApplication";
import NodeList from "../NodeList";

export default function Sequence() {
  const {
    userInterface,
    openSequencesList,
    selectedSequence,
    editSequence,
    removeSequence,
    selectNode,
    selectedNode,
    addNode
  } = useApplication();

  const [filter, setFilter] = useState("");
  const [filteredNodes, setFilteredNodes] = useState(selectedSequence?.nodes);

  // If the selected node changes then scroll to it
  useEffect(() => {
    if (!selectedNode) return;

    function scrollToNode() {
      const element = document.querySelector(`[data-node-id="${selectedNode.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        setTimeout(scrollToNode, 100);
      }
    }
    scrollToNode();
  }, [selectedNode]);

  // If we add a new node or delete a node then reset the filter
  useEffect(() => {
    setFilter("");
    setFilteredNodes(filterNodes("", selectedSequence?.nodes));
  }, [selectedSequence?.nodes.length]);

  useEffect(() => {
    // If we edit a node then we need to update the filtered list
    setFilteredNodes(filterNodes(filter, selectedSequence?.nodes));
  }, [selectedSequence]);

  function onFilterChange(f) {
    setFilteredNodes(filterNodes(f, selectedSequence.nodes));
    setFilter(f);
  }

  return (
    <>
      <Head>
        <title>
          SayWhat - {selectedSequence?.name ?? "No seqeunce selected"} {userInterface.hasUnsavedChanges ? "*" : ""}
        </title>
      </Head>

      <Panel>
        <Header>
          <button data-icon="menu" onClick={() => openSequencesList()}>
            <strong data-testid="sequences-button">{selectedSequence?.name ?? "Sequences"}</strong>
          </button>
          {selectedSequence && (
            <>
              <button onClick={() => editSequence()} data-testid="edit-button">
                Edit
              </button>
              <button onClick={() => removeSequence(selectedSequence)} data-testid="delete-button">
                Delete
              </button>

              <Spacer />
              <button data-icon="add" onClick={() => addNode()} data-testid="add-node-button">
                Add node
              </button>
              <input
                value={filter}
                onChange={e => onFilterChange(e.target.value)}
                placeholder="Filter nodes"
                data-testid="filter-input"
              />
            </>
          )}
        </Header>

        <Section>
          <div className="Nodes">
            <NodeList nodes={filteredNodes} selectedNode={selectedNode} onSelectNode={selectNode} />
          </div>
        </Section>
      </Panel>

      <style jsx>{`
        .Nodes {
          padding: 0 0 3rem 0;
          position: relative;

          margin: auto;
          max-width: var(--main-width);
          position: relative;
        }
      `}</style>
    </>
  );
}
