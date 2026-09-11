# TEMPLATE — Message (not a submitted event)

```text
message_id: unique sender-scoped ID
task_id:
assignment_generation:
sender_agent_id:
recipient_ids:
kind: assignment_request / assignment_grant / question / finding / blocker / contract_change / progress / result / acknowledgment
created_at: full UTC timestamp
expected_task_record_version:
packet_revision:
relevant_contract_versions:
in_reply_to: message ID or null
acknowledgment_required:
summary:
evidence_or_artifact_refs:
requested_action:
```

For troubleshooting progress, include hypothesis, attempted change, result, next experiment, and budget remaining. For results, include artifact revision, check results, unrun checks, and limitations. Do not put secrets or private runtime data into publicly committed messages.

The coordinator owns received time, event sequence, disposition, and resolution references in the board. Senders do not assign those fields. Finish the file, then explicitly submit its path; replies/corrections are new files referencing the original ID.
