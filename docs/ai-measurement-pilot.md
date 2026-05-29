# Team-Level AI Measurement Pilot

This repository can implement the lightweight AI measurement approach from `AI_Measurement_Action_Plan.docx` without organization-wide telemetry or enterprise AI billing access.

## What We Can Implement Now

- PR template AI usage declaration.
- Automated PR labels for likely AI-assisted work.
- Agent-authored PR detection from actor, branch, and PR body signals.
- Generated documentation and test labels based on changed files.
- Team-level trend data through GitHub PR labels and repository APIs.
- Monthly anonymous pulse survey outside the repo.

## Guardrails

- Report only team and workflow-level metrics.
- Do not use AI usage signals for individual performance evaluation.
- Treat automated labels as directional indicators, not proof.
- Let developers or reviewers confirm or correct labels.

## Initial Metrics

| Dimension | Metric | Source |
| --- | --- | --- |
| Utilization | AI-assisted PR percentage | PR labels and template responses |
| Utilization | AI-agent-authored PR count | Actor, branch, and body detection |
| Delivery | PR throughput | GitHub pull request API |
| Delivery | PR cycle time | PR opened and merged timestamps |
| Delivery | Review turnaround time | Review submitted timestamps |
| Quality | Failed checks and reopened PRs | GitHub checks and PR events |
| Experience | Estimated hours saved | Monthly anonymous survey |

## Labels

- `ai-assisted-confirmed`
- `ai-assisted-likely`
- `ai-agent-authored`
- `ai-generated-tests`
- `ai-generated-docs`
- `ai-usage-unknown`

## 90-Day Pilot

1. Weeks 1-2: Use the PR template and automated AI labels in this repository.
2. Weeks 3-4: Validate label accuracy and tune detection rules.
3. Weeks 5-6: Build a simple dashboard from GitHub PR labels, cycle time, and review time.
4. Weeks 7-8: Run the first anonymous pulse survey.
5. Weeks 9-12: Pick one narrow agent workflow and measure review effort, acceptance, and rework.

## Recommended First Dashboard Panels

- AI-assisted PR percentage.
- Confirmed vs likely vs unknown AI usage.
- Agent-authored PR count.
- PR cycle time and review turnaround time.
- Failed checks by AI label.
- Monthly survey time-savings summary.

## Implementation Status

- Added `.github/pull_request_template.md`.
- Added `.github/workflows/ai-pr-tagging.yml`.
- Added this pilot note for team communication and rollout.
