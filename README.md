# PPE-Catalog

Створи внутрішній десктопний вебзастосунок для корпоративних закупівель ЗІЗ (White-label, світлий мінімалістичний дизайн у стилі Tailwind CSS / Shadcn UI). Екран має містити:

Шапку: Назва холдингу «ТОВ «БУД-АЛЬЯНС»», індикатор підключення ERP та назва підрозділу-замовника «ТОВ «Буд-1»».

Основну сітку каталогу товарів: унікальні коди ТМЦ (наприклад, ТМЦ-44091), умовні назви (Каска захисна, Костюм робочий тощо), постачальники (Постачальник А, Б, В), ціни без ПДВ і з ПДВ, залишки та кнопка «Додати в заявку» або лічильник кількості (+/-).

Фіксовану праву панель (Поточна заявка / Кошик): список обраних позицій, зміна кількості, автоматичний перерахунок суми без ПДВ, ПДВ 20% та загальної суми до сплати.

Функціональну кнопку «Вивантажити заявку в Excel (.xlsx)», яка за допомогою бібліотеки xlsx (SheetJS) реально генерує та завантажує файл із колонками: Код ТМЦ, Назва товару, Кількість, Ціна без ПДВ, Сума без ПДВ, Сума з ПДВ.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a5f2244d-ef3b-5bfe-9e7e-ba8ce1a49115).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
