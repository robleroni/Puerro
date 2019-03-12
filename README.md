# Puerro Project

The goal of this project is to research how to build modern web applications as simple as possible.

## Idea

To not loose our train of thought, we need to have a structured method on how to handle the research process.

The idea is to build a showcase project by simulating interactions between a developer and a customer.

- **Customer**: wants an easy to use and modern web application
- **Developer**: wants to develop the application as simple as possible

Therefore, the developer needs to research and evaluate different approaches to build the application
as simple as possible while still meeting customer demands.

The showcase application should contain as many UI-Patterns as possible.

## Folder Structure

| Folder                 | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| [docs/](docs/)         | Documentation like the logbook                        |
| [huerto/](huerto/)     | Showcase project of the research process              |
| [puerro/](puerro/)     | Actual project including mainly the abstractions used |
| [research/](research/) | Different ideas/approaches which have been evaluated  |
| [test/](test/)         | Test results combined in one place                    |

## Build instructions

### Requirements

Tested with:

- npm version _6.4.1_ and _6.7.0_
- node version _10.11.0_ and _11.10.1_

### How to run

```
npm install     // to install the dev dependency 'rollup'
npm start       // to bundle the scripts and watch for changes
```

### How to test/verify

| Repository online                             | verify local code              |
| --------------------------------------------- | ------------------------------ |
| [All Tests](test/src/AllTests.html)           | `open test/AllTests.html`      |
| [Puerro Tests](test/src/PuerroTests.html)     | `open test/PuerroTests.html`   |
| [Huerto Tests](test/src/HuertoTests.html)     | `open test/HuertoTests.html`   |
| [Research Tests](test/src/ResearchTests.html) | `open test/ResearchTests.html` |
