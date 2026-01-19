#!/usr/bin/env node

/**
 * ComicWise CLI - Unified Command-Line Interface
 * Complete platform management tool
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('comicwise')
  .description('ComicWise Platform Management CLI')
  .version('1.0.0');

// Development Commands
const dev = program
  .command('dev')
  .description('Development commands');

dev
  .command('start')
  .description('Start development server')
  .action(async () => {
    const spinner = ora('Starting development server...').start();
    try {
      execSync('pnpm dev', { stdio: 'inherit' });
      spinner.succeed('Development server started');
    } catch (error) {
      spinner.fail('Failed to start development server');
      console.error(error);
    }
  });

dev
  .command('build')
  .description('Build for production')
  .action(async () => {
    const spinner = ora('Building application...').start();
    try {
      execSync('pnpm build', { stdio: 'inherit' });
      spinner.succeed('Build completed successfully');
    } catch (error) {
      spinner.fail('Build failed');
      console.error(error);
    }
  });

dev
  .command('lint')
  .description('Run linter')
  .option('--fix', 'Auto-fix linting errors')
  .action(async (options) => {
    const spinner = ora('Running linter...').start();
    try {
      const cmd = options.fix ? 'pnpm lint:fix' : 'pnpm lint';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Linting completed');
    } catch (error) {
      spinner.fail('Linting failed');
      console.error(error);
    }
  });

dev
  .command('format')
  .description('Format code with Prettier')
  .action(async () => {
    const spinner = ora('Formatting code...').start();
    try {
      execSync('pnpm format', { stdio: 'inherit' });
      spinner.succeed('Code formatted successfully');
    } catch (error) {
      spinner.fail('Formatting failed');
      console.error(error);
    }
  });

dev
  .command('type-check')
  .description('Run TypeScript type checking')
  .action(async () => {
    const spinner = ora('Checking types...').start();
    try {
      execSync('pnpm type-check', { stdio: 'inherit' });
      spinner.succeed('Type checking completed');
    } catch (error) {
      spinner.fail('Type checking failed');
      console.error(error);
    }
  });

// Database Commands
const db = program
  .command('db')
  .description('Database management commands');

db
  .command('migrate')
  .description('Run database migrations')
  .action(async () => {
    const spinner = ora('Running migrations...').start();
    try {
      execSync('pnpm db:migrate', { stdio: 'inherit' });
      spinner.succeed('Migrations completed');
    } catch (error) {
      spinner.fail('Migration failed');
      console.error(error);
    }
  });

db
  .command('seed')
  .description('Seed database with sample data')
  .option('--reset', 'Reset database before seeding')
  .action(async (options) => {
    if (options.reset) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will delete all existing data. Continue?',
          default: false,
        },
      ]);
      
      if (!confirm) {
        console.log(chalk.yellow('Seed cancelled'));
        return;
      }
    }
    
    const spinner = ora('Seeding database...').start();
    try {
      const cmd = options.reset ? 'pnpm db:seed:reset' : 'pnpm db:seed';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Database seeded successfully');
    } catch (error) {
      spinner.fail('Seeding failed');
      console.error(error);
    }
  });

db
  .command('studio')
  .description('Open Drizzle Studio')
  .action(async () => {
    const spinner = ora('Opening Drizzle Studio...').start();
    try {
      execSync('pnpm db:studio', { stdio: 'inherit' });
      spinner.succeed('Drizzle Studio opened');
    } catch (error) {
      spinner.fail('Failed to open Drizzle Studio');
      console.error(error);
    }
  });

db
  .command('reset')
  .description('Reset database')
  .action(async () => {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will delete all data. Are you sure?',
        default: false,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Reset cancelled'));
      return;
    }
    
    const spinner = ora('Resetting database...').start();
    try {
      execSync('pnpm db:reset', { stdio: 'inherit' });
      spinner.succeed('Database reset successfully');
    } catch (error) {
      spinner.fail('Reset failed');
      console.error(error);
    }
  });

// Testing Commands
const test = program
  .command('test')
  .description('Testing commands');

test
  .command('unit')
  .description('Run unit tests')
  .option('--watch', 'Watch mode')
  .option('--coverage', 'Generate coverage report')
  .action(async (options) => {
    const spinner = ora('Running unit tests...').start();
    try {
      let cmd = 'pnpm vitest run';
      if (options.watch) cmd = 'pnpm vitest watch';
      if (options.coverage) cmd += ' --coverage';
      
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Tests completed');
    } catch (error) {
      spinner.fail('Tests failed');
      console.error(error);
    }
  });

test
  .command('e2e')
  .description('Run E2E tests')
  .option('--ui', 'Run with UI mode')
  .action(async (options) => {
    const spinner = ora('Running E2E tests...').start();
    try {
      const cmd = options.ui ? 'pnpm test:e2e:ui' : 'pnpm test:e2e';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('E2E tests completed');
    } catch (error) {
      spinner.fail('E2E tests failed');
      console.error(error);
    }
  });

test
  .command('all')
  .description('Run all tests')
  .action(async () => {
    const spinner = ora('Running all tests...').start();
    try {
      execSync('pnpm test:all', { stdio: 'inherit' });
      spinner.succeed('All tests completed');
    } catch (error) {
      spinner.fail('Tests failed');
      console.error(error);
    }
  });

// Docker Commands
const docker = program
  .command('docker')
  .description('Docker management commands');

docker
  .command('up')
  .description('Start Docker containers')
  .option('--build', 'Rebuild containers')
  .action(async (options) => {
    const spinner = ora('Starting Docker containers...').start();
    try {
      const cmd = options.build
        ? 'docker-compose up --build -d'
        : 'docker-compose up -d';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Docker containers started');
    } catch (error) {
      spinner.fail('Failed to start containers');
      console.error(error);
    }
  });

docker
  .command('down')
  .description('Stop Docker containers')
  .option('--volumes', 'Remove volumes')
  .action(async (options) => {
    const spinner = ora('Stopping Docker containers...').start();
    try {
      const cmd = options.volumes
        ? 'docker-compose down -v'
        : 'docker-compose down';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Docker containers stopped');
    } catch (error) {
      spinner.fail('Failed to stop containers');
      console.error(error);
    }
  });

docker
  .command('logs')
  .description('View Docker logs')
  .option('-f, --follow', 'Follow log output')
  .action(async (options) => {
    try {
      const cmd = options.follow
        ? 'docker-compose logs -f'
        : 'docker-compose logs';
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      console.error(error);
    }
  });

// Deployment Commands
const deploy = program
  .command('deploy')
  .description('Deployment commands');

deploy
  .command('vercel')
  .description('Deploy to Vercel')
  .option('--prod', 'Deploy to production')
  .action(async (options) => {
    const spinner = ora('Deploying to Vercel...').start();
    try {
      const cmd = options.prod ? 'vercel --prod' : 'vercel';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Deployment completed');
    } catch (error) {
      spinner.fail('Deployment failed');
      console.error(error);
    }
  });

// Maintenance Commands
const maintain = program
  .command('maintain')
  .description('Maintenance commands');

maintain
  .command('clean')
  .description('Clean build artifacts and dependencies')
  .action(async () => {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will remove node_modules, .next, and build folders. Continue?',
        default: false,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Clean cancelled'));
      return;
    }
    
    const spinner = ora('Cleaning...').start();
    try {
      execSync('pnpm clean', { stdio: 'inherit' });
      spinner.succeed('Clean completed');
    } catch (error) {
      spinner.fail('Clean failed');
      console.error(error);
    }
  });

maintain
  .command('update')
  .description('Update dependencies')
  .option('--latest', 'Update to latest versions')
  .action(async (options) => {
    const spinner = ora('Updating dependencies...').start();
    try {
      const cmd = options.latest ? 'pnpm update --latest' : 'pnpm update';
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Dependencies updated');
    } catch (error) {
      spinner.fail('Update failed');
      console.error(error);
    }
  });

maintain
  .command('audit')
  .description('Security audit')
  .action(async () => {
    const spinner = ora('Running security audit...').start();
    try {
      execSync('pnpm audit', { stdio: 'inherit' });
      spinner.succeed('Audit completed');
    } catch (error) {
      spinner.fail('Audit found issues');
      console.error(error);
    }
  });

// Generate Commands
const generate = program
  .command('generate')
  .alias('g')
  .description('Code generation commands');

generate
  .command('component <name>')
  .description('Generate a new component')
  .option('-d, --directory <dir>', 'Component directory')
  .action(async (name, options) => {
    const spinner = ora(`Generating component ${name}...`).start();
    try {
      const dir = options.directory || 'components';
      const componentPath = path.join(process.cwd(), 'src', dir, `${name}.tsx`);
      
      const template = `export function ${name}() {
  return (
    <div>
      <h1>${name}</h1>
    </div>
  );
}
`;
      
      fs.writeFileSync(componentPath, template);
      spinner.succeed(`Component ${name} created at ${componentPath}`);
    } catch (error) {
      spinner.fail('Failed to generate component');
      console.error(error);
    }
  });

// Info Command
program
  .command('info')
  .description('Display project information')
  .action(() => {
    console.log(chalk.cyan.bold('\n📚 ComicWise Platform\n'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.white('Version:'), chalk.green('1.0.0'));
    console.log(chalk.white('Framework:'), chalk.green('Next.js 16 + React 19'));
    console.log(chalk.white('Database:'), chalk.green('PostgreSQL + Drizzle ORM'));
    console.log(chalk.white('Styling:'), chalk.green('Tailwind CSS 4'));
    console.log(chalk.white('Auth:'), chalk.green('NextAuth.js v5'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.white('\nRun'), chalk.cyan('comicwise --help'), chalk.white('for available commands\n'));
  });

program.parse();
