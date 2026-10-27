# Security policy

This repository publishes a generated map of AnyPS5 compatibility. The data is public and the
page is static; the map reads public GitHub data and nothing else. The things worth reporting are
therefore narrow, but they matter.

## Report a problem privately

Use GitHub's private vulnerability reporting on this repository:

1. Open <https://github.com/authurtabo-byte/anyps5-roadmap/security/advisories/new>.
2. Describe what you found, how to reproduce it, and what it could expose.

That report is visible only to the maintainers until an advisory is published. Do not open a
public issue, and do not post the details in a discussion, for anything that could expose data or
take over a page.

If the private form is unavailable, message the maintainer through their GitHub profile
([@authurtabo-byte](https://github.com/authurtabo-byte)) with a one-line summary and no details;
a private channel is arranged from there.

## What is in scope

- A flaw in the published page that could run code in a visitor's browser, or serve content that
  did not come from the build.
- A way to inject or alter data in the map through a report, an issue form, or an upstream thread.
- A secret, key, credential or internal detail that has been committed to this repository.
- A dependency with a known vulnerability that the page actually uses.

## What is out of scope

- A wrong stage, a missing blocker or a broken link. Those are data corrections: use the "Report a
  correction" button on the page or the issue forms.
- The content of upstream issues, comments or logs. Those belong to their authors and to AnyPS5's
  own tracker.
- Anything that requires the reporter's own machine to be compromised first.

## How the map handles data

The map stores no accounts, no submissions and no visitor data. What it shows is quoted from
public GitHub threads with a link to the source, plus the facts curated in `data/`. There is no
private user content to expose.

## Secrets

Nothing that reaches a model or an API is stored in this repository. Credentials are supplied at
run time by whoever operates the map and are never written to a tracked file. If you find a key,
token, endpoint or internal detail in the tree, treat it as a security report and use the private
form above rather than a pull request.

## Supported versions

The live map and the `main` branch are the supported versions. Older commits and forks are not
maintained.
