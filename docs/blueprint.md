# **App Name**: Duo Rico

## Core Features:

- Secure User Accounts: User authentication and management to securely store and manage couples financial data, while adhering to all privacy requirements by not collecting any unnecessary data. The user can opt-in for marketing communications and other features as appropriate.
- Financial Overview: Dashboard providing an overview of income, expenses, and balance for the current month. Color-coded display for income (green), expenses (red), and balance (gold).
- Income Management: Add and manage income entries with description, value, category, and month/year selection. Option for recurring income with adjustable installments up to 48x. This can use the Auth data as the default option. Note that we will generate queries for the table definitions as well, for use with Supabase.
- Expense Management: Add and manage expense entries with description, value, category, and month/year selection. Option for recurring expenses with adjustable installments up to 48x. There will also be functionality to fully delete future expenses or just the expense for that particular month.
- Recent Transactions: Display last three created expenses on dashboard.
- Local Storage Simulation: Temporary data persistence in local storage for testing before migrating to Supabase. However, the localstorage data format will precisely mimic the final Supabase data structure, and use all the same types.

## Style Guidelines:

- Primary color: Gold (#D4AF37) to represent wealth and financial management. Gold was chosen as the user requested that gold be used, but toned down to work as an aesthetic and be accessible.
- Background color: Light beige (#F5F5DC) as a desaturated, brighter tint of gold for a calm background.
- Accent color: Forest green (#228B22) to complement gold and highlight positive income changes.
- Inter from Google Fonts for clear, modern text.
- Responsive design to support mobile, tablet, and desktop screens, with scrolling for smaller displays.
- Clear, simple icons for navigation and actions.