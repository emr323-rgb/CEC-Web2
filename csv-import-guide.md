# CSV Import Guide for Lakewood Sales Tracker

This guide will help you prepare CSV files for importing sales data into the Lakewood Sales Tracker.

## Required Columns

Your CSV file must contain the following columns:
- **Product** or **Item Name** - The name of the product
- **Store ID** - The ID number of the store (must match a store in the system)
- **Sale Price** - The current sale price of the item

## Optional Columns

The following columns are optional but recommended:
- **Category** - The product category (e.g., Produce, Dairy, Meat)
- **Regular Price** - The regular non-sale price of the item

If the regular price is missing, the system will automatically estimate it as 20% higher than the sale price.

## Column Name Variations

The system can recognize various common column names:

| Data           | Recognized Column Names                                           |
|----------------|------------------------------------------------------------------|
| Product        | "Product", "Item Name", "Product Name", "Item"                   |
| Category       | "Category", "Category Name"                                      |
| Store ID       | "Store ID", "StoreID", "Store Id"                                |
| Regular Price  | "Regular Price", "RegularPrice", "Normal Price", "Original Price"|
| Sale Price     | "Sale Price", "SalePrice", "Discount Price"                      |

## Supported Price Formats

The system supports various price formats:

| Format         | Example       | Notes                                              |
|----------------|---------------|---------------------------------------------------|
| Decimal        | 3.99          | Plain number                                      |
| With dollar    | $3.99         | Dollar sign will be automatically removed         |
| Multi-buy      | 2/$5          | Will be converted to price per unit ($2.50)       |
| Multiple items | 3/$10         | Will be converted to price per unit ($3.33)       |

## Sample CSV Format

```
Product,Category,Store ID,Regular Price,Sale Price
"Organic Bananas","Produce",4,"1.99","0.99"
"Ground Beef (80/20)","Meat",4,"5.99","3.99"
"Whole Milk (1 gallon)","Dairy",4,"4.99","3.49"
"Apples - 3lb Bag","Produce",4,"4.99","2/$5"
```

## Common Errors and Solutions

| Error                               | Solution                                      |
|-------------------------------------|--------------------------------------------- |
| "Store ID not found"                | Check that the Store ID exists in the system  |
| "Invalid CSV format"                | Ensure your CSV is properly formatted        |
| "Missing required columns"          | Make sure your CSV has Product, Store ID, and Sale Price |
| "Error parsing file"                | Check for special characters or encoding issues |

## Tips for Successful Imports

1. Keep your CSV file under 10MB
2. Make sure all Store IDs match existing stores
3. Use quotes around text fields, especially if they contain commas
4. Review the sample file for reference

You can download a [sample import file](./sample-import.csv) to use as a template.