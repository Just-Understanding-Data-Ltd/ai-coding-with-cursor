Write a Git commit message for all of the work that you have just done in a session. If there is no chat history, then find all of the files that have been changed by using a linux git command and then write a commit message that encapsulates all of the changes.

Avoid containing any new line characters within the message and make it a single line.

Then you should also run `git commit -m "message"`.

Use these commit message formats:

## Basic Structure

<type>[optional scope]: <description>
[optional body]
[optional footer(s)]

## Types

- `feat:` - new features (MINOR version bump)
- `fix:` - bug fixes (PATCH version bump)
- `docs:` - documentation changes
- `style:` - formatting, missing semicolons, etc.
- `refactor:` - code changes that neither fix bugs nor add features
- `perf:` - performance improvements
- `test:` - adding/updating tests
- `chore:` - updating build tasks, package manager configs, etc.
- `ci:` - CI/CD related changes

## Tips

- Keep first line under 72 characters
- Use present tense ("add" not "added")
- Be descriptive but concise
- Reference issues/PRs in footer: `Refs: #123`

Avoid including any illegal modifiers in the commit message.
