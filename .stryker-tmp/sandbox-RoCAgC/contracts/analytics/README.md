# Analytics Contract

Tracks student course progress on-chain and emits Soroban events for off-chain indexers.

## Functions

| Function | Auth | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup, stores admin address |
| `set_admin(new_admin)` | current admin | Transfer admin role |
| `get_admin()` | — | Read current admin |
| `record_progress(caller, student, course_id, progress_pct)` | caller (student or admin) | Record/update progress (0–100) |
| `get_progress(student, course_id)` | — | Read a student's progress record |

## Events

All events use the contract address as the emitting address.

### `("analytics", "prog_upd")`

Emitted on **every** `record_progress` call.

**Topics:**
```
topic[0]: Symbol("analytics")
topic[1]: Symbol("prog_upd")
```

**Data:**
```
(student: Address, course_id: Symbol, progress_pct: u32)
```

---

### `("analytics", "completed")`

Emitted **only** when `progress_pct == 100`.

**Topics:**
```
topic[0]: Symbol("analytics")
topic[1]: Symbol("completed")
```

**Data:**
```
(student: Address, course_id: Symbol)
```

## Storage

| Key | Type | Storage | Description |
|---|---|---|---|
| `Admin` | `Address` | Instance | Contract administrator |
| `Progress(Address, Symbol)` | `ProgressRecord` | Persistent | Per-student per-course record |

## ProgressRecord Schema

```rust
pub struct ProgressRecord {
    pub student: Address,
    pub course_id: Symbol,
    pub progress_pct: u32,   // 0–100
    pub completed: bool,     // true when progress_pct == 100
    pub timestamp: u64,      // ledger timestamp at last update
}
```
