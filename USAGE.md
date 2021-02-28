# SayWhat Usage

[SayWhat](https://nathanhoad.itch.io/saywhat) is designed to be a simple way to create dialogue-flows (like conversations in videogames) that lead to more dialogues or actions. The script has a very simple format, so you can focus on your story, while you are writing them.

### Sequences

Sequences are just a way of grouping dialogue nodes by whatever makes sense to your project (like scenes, for a movie).

### Nodes

Nodes contain lines of dialogue and then a list of responses for either exiting the conversation or progressing to another node or performing a mutation.

### Conditions and Mutations

Any line or prompt can have a condition attached. Conditions call out to the engine at runtime to check some state and hide the line unless it is resolved as true.

Mutations call out to the engine and affect state. For example, a character might say "Here, have this thing" and then the engine could run a 'GiveThing' mutation which runs an animation and then updates the character's inventory before continuing the dialogue flow. Think of these as the individual events that happen in a scene, in a script.

### Exporting

The app has exports to XML and JSON, and Godot resource file ().

Both formats simply list out every line and group of responses as their own nodes (per sequence/scene). Each node in this context then points to the next node by a generated ID.

The idea would be that you can request an entry point and then just step through each line.

## The Language

SayWhat has it's own [DSL](https://en.wikipedia.org/wiki/Domain-specific_language), that is unconcerned with how you will be using it. This means with one editor & language, you can edit the dialogs for any game engine/framework (as long as you setup a loader on that end.)

### Bindings

SayWhat currently only has ready-made [bindings for Godot](https://github.com/nathanhoad/saywhat_godot), but the format is simple enough you should be able to use it with anything, using JSON/XML. Even with the [Godot bindings](https://github.com/nathanhoad/saywhat_godot), you will still need to set up how it is displayed, but it makes it much easier to use.

An example of usage for Godot can be seen in [this video](https://youtu.be/mmUxl46h24M) or in [this example project](https://github.com/nathanhoad/saywhat_godot_example).

### API

All lines can be either `<CHARACTER>: message`, where `<CHARACTER>` is the name of the person talking. Commands (`if` / `do`) are run in the context of your scene/class, so use your Godot scene to define variables and action-methods (for `do`.) Choices go in the bottom-section,

- `<CHARACTER>: message` - Say something as `CHARACTER`
- `[if CONDITION]` - Test for a condition before calling the dialog
- `[do ACTION param param param...]` - Run method or assign directly (like `[do cool=1]`])
- `<TEXT> -> action` - a choice. The choice can also be `END` to end the node.
- `# comment` - keep comments for yourself

### Example

#### Start

```
Character: Hello!
[if !has_met_character] Character: It's nice to meet you.

# This is a comment
[do has_met_character = true]

Can you repeat that? -> Start
That's all for now -> END
```

So here, you name it `Start`, and it will print message `Hello!` from `Character`. if your `GODOT_SCENE.has_met_character` is not truthy, it will print `It's nice to meet you.`. It has a comment, and sets `GODOT_SCENE.has_met_character` to `true`. After that it has a choice, with 2 options, to either go back to `Start` (loop) or `END` to stop the dialogue.
