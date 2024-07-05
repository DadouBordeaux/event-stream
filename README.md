# typescript-event-stream
A helper for creating events stream, supports snapshots

## installation
`yarn add typescript-event-stream`
`npm -D typescript-event-stream`

## What for ?
```typescript
import { EventStream } from 'typescript-event-stream';

type Withdraw = {
  type: "withdraw";
  amount: number;
};

type Deposit = {
  type: "deposit";
  amount: number;
};

type Events = Withdraw | Deposit;

const eventStream = new EventStream<Events, undefined>([]);
eventStream.addEvent({ type: "deposit", amount: 100 });
eventStream.addEvent({ type: "withdraw", amount: 50 });

class BankAcountProjection
  implements ProjectionBuilder<Events, undefined, number>
{
  execute(history: Events[], historyChanges: Events[]): number {
    return history.reduce((acc, event) => {
        return event.type === "deposit" ? acc + event.amount : acc - event.amount;
    }, 0);
  }
}

// Projection :
eventStream.project(new BankAcountProjection()); // 50
// Save, where you can use eventStream.getEvents() for all events or eventStrem.getChanges() tonly for the changes
await repository.save(eventStream);

```



