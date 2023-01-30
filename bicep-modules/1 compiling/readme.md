# Decompile

We can decompile from ARM => Bicep with

```shell
bicep decompile site-example.json
```

Which will give use `site-example.bicep`

# Build

We can also build from Bicep back to ARM with

```shell
bicep build site-example.bicep
```

Which will give us `site-example.json`