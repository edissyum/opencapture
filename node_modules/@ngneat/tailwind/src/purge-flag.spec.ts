import { guessProductionMode } from './purge-flag';

function runGuessProductionMode(command) {
  const commandArr = command.split(' ');
  const originalArgv = [...process.argv];
  process.argv.push(...commandArr);
  const result = guessProductionMode();
  process.argv = originalArgv;
  return result;
}

describe('Guess production mode', () => {
  test.each([
    ['ng build', true],
    ['ng b', true], // TODO - NX, Ionic - ?
    ['ng serve', false],
    ['ng serve --prod', true],
    ['\\node_modules\\@nrwl\\cli\\lib\\run-cli.js run project:build:production', true],
    ['project_build_name\\node_modules\\@nrwl\\cli\\lib\\run-cli.js somecommand', false],
    ['\\node_modules\\@buider\\cli\\lib\\run-cli.js somecommand', false]
  ])(
    '%s should return %s',
    (command, expected) => {
      expect(runGuessProductionMode(command)).toBe(expected);
    },
  );

  it('Node env not development should return false', () => {
    process.env.NODE_ENV = 'development';
    const result = guessProductionMode();
    expect(result).toBe(false);
  });

  it('Node env not production should return true', () => {
    process.env.NODE_ENV = 'production';
    const result = guessProductionMode();
    expect(result).toBe(true);
  });
});
