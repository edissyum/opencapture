# Angular Tailwind CSS Schematics

This schematic will add [Tailwind CSS](https://tailwindcss.com/) to your [Angular](https://angular.io) application.

![Angular Tailwind CSS Schematics][demo]

[demo]: https://github.com/ngneat/tailwind/raw/master/assets/ngneat-tailwind.gif

## Usage

```
ng add @ngneat/tailwind
```

## Usage with Nx

In Nx, you can either use `AngularCLI` or `NxCLI`. If you setup your Nx Workspace to use `AngularCLI`, the usage is the
same as above. If you setup your Nx Workspace with `NxCLI`, follow the steps:

Install `@ngneat/tailwind` first:

```
npm i -D @ngneat/tailwind
yarn add -D @ngneat/tailwind
```

then execute the schematics:

```
nx generate @ngneat/tailwind:nx-setup
```

## Purge

`@ngneat/tailwind` uses built-in `purge` functionality by `tailwindcss` (under the hood, it
is [postcss-purgecss](https://github.com/FullHuman/purgecss/tree/master/packages/postcss-purgecss)). By
default, `@ngneat/tailwind` sets the `content` to any **HTML** and any **TS** files in the project.

This behavior can be modified as the consumers see fit.

## Contributing

- Fork this repo and clone the fork on your machine.
- Run `npm install` to install all the dependencies
- Start working on changes

### Structure

```
_apps
 |__tailwind-e2e (e2e tests)
_libs
 |__tailwind
    |__src
       |__schematics
          |__ng-add (AngularCLI schematics)
          |__nx-setup (NxCLI schematics)
          |__files (files template to be generated)
          |__specs (unit tests)
          |__schema.d.ts (interface)
       |__constants (constants used in the project)
       |__utils (utilities functions)
       |__collection.json (schematics configuration)
       |__package.json (package.json of @ngneat/tailwind which will be published to npm)
```

### Commit

- Run `git add .` to stage your changes
- Run `npm run commit` to start Conventional Commit flow

### Commit Hooks

pre-commit will execute `npm run lint` and `pretty-quick` to lint and reformat.pre-commit does not run Unit Tests
because Unit Tests will be ran in Github Actions. Feel free to run the Unit Tests with `npm run test` to test your
changes

### E2E Tests

Please run `npm run e2e` to run E2E tests before pushing

### Updating README

`README` is in two places at the moment: root and `libs/tailwind/README.md`. The one in root is the one displayed on
Github while the one in `libs/tailwind` is being used on `npm`. When you make changes to `README`, make sure to update
both.

> A script can be created to automating this.

### PR

When everything passes and looks good, make a PR. Thanks for your contribution.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://nartc.me/"><img src="https://avatars1.githubusercontent.com/u/25516557?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Chau Tran</b></sub></a><br /><a href="#question-nartc" title="Answering Questions">💬</a> <a href="https://github.com/ngneat/tailwind/commits?author=nartc" title="Code">💻</a> <a href="https://github.com/ngneat/tailwind/commits?author=nartc" title="Documentation">📖</a> <a href="#example-nartc" title="Examples">💡</a> <a href="#ideas-nartc" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-nartc" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-nartc" title="Maintenance">🚧</a> <a href="https://github.com/ngneat/tailwind/pulls?q=is%3Apr+reviewed-by%3Anartc" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/ngneat/tailwind/commits?author=nartc" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.netbasal.com/"><img src="https://avatars1.githubusercontent.com/u/6745730?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Netanel Basal</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=NetanelBasal" title="Code">💻</a> <a href="#ideas-NetanelBasal" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.santoshyadav.dev/"><img src="https://avatars3.githubusercontent.com/u/11923975?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Santosh Yadav</b></sub></a><br /><a href="#ideas-santoshyadavdev" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-santoshyadavdev" title="Mentoring">🧑‍🏫</a></td>
    <td align="center"><a href="https://bilalkhoukhi.com/"><img src="https://avatars1.githubusercontent.com/u/4480581?v=4?s=75" width="75px;" alt=""/><br /><sub><b>BK</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=Bilal-io" title="Code">💻</a> <a href="#ideas-Bilal-io" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/beeman"><img src="https://avatars3.githubusercontent.com/u/36491?v=4?s=75" width="75px;" alt=""/><br /><sub><b>beeman</b></sub></a><br /><a href="#ideas-beeman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-beeman" title="Mentoring">🧑‍🏫</a></td>
    <td align="center"><a href="https://github.com/vltansky"><img src="https://avatars0.githubusercontent.com/u/5851280?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Vlad Tansky</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=vltansky" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome!
