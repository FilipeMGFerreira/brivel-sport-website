import { ListingType } from '../enums/listing-type.enum';
import { ListingStatus } from '../enums/listing-status.enum';
import { PartCondition } from '../enums/part-condition.enum';
import { Money } from '../value-objects/money.vo';

export class Listing {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public readonly type: ListingType,
    public category: string,
    public status: ListingStatus,
    /** When false, listing is hidden from the public list (deactivated). */
    public isVisible: boolean,
    public sellerEmail: string,
    /** Optional phone/WhatsApp for wa.me contact; when set, WhatsApp option is shown on listing detail. */
    public sellerPhone?: string,
    public price?: Money,
    public condition?: PartCondition,
    public subcategory?: string,
    public attributes?: Record<string, unknown>,
    public imageUrls?: string[],
    /** Optional tags for filtering (e.g. "bmw-e46", "audi-a4"). Display and URL slug. */
    public tags?: string[],
    public createdAt?: Date
  ) {}
}
