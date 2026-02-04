export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'EUR'
  ) {}

  static fromNumber(amount: number, currency?: string): Money {
    return new Money(amount, currency ?? 'EUR');
  }
}
