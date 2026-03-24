# @sklx/cli

Terminal client for the SKL registry.

## Install

```bash
npm install -g @sklx/cli
```

Or run it without installing:

```bash
npx @sklx/cli add "crazy ideas to mvp"
```

## Quick Start

Open the terminal UI:

```bash
skl tui
```

Install a skill fast:

```bash
skl add "crazy ideas to mvp"
```

Inspect a skill:

```bash
skl inspect crazy-ideas-to-mvp
```

Connect your account:

```bash
skl login
```

Publish from a local skill folder:

```bash
skl publish
```

Update an existing published skill:

```bash
skl update
```

## Registry

Use production explicitly when needed:

```bash
skl add "crazy ideas to mvp" --registry https://sklx.one
```

## Package Binary

This package installs the `skl` command.
