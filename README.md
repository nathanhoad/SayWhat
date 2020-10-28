# SayWhat

A simple branching dialogue editor.

Get a prebuilt copy from [nathanhoad.itch.io/saywhat](https://nathanhoad.itch.io/saywhat).

## Sequences

Sequences are just a way of grouping dialogue nodes by whatever makes sense to your project (eg. scenes).

## Nodes

Nodes contain lines of dialogue and then a list of responses for either exiting the conversation or progressing to another node.

## Conditions and Mutations

Any line or prompt can have a condition attached. Conditions call out to the engine at runtime to check some state and hide the line unless it is resolved as true.

Mutations call out to the engine and affect state. For example, a character might say "Here, have this thing" and then the engine could run a 'GiveThing' mutation which runs an animation and then updates the character's inventory before continuing the dialogue flow.

## Exporting

The app has exports to XML and JSON.

Both formats simply list out every line and group of responses as their own nodes (per sequence/scene). Each node in this context then points to the next node by a generated ID.

The idea would be that you can request an entry point and then just step through each line.
