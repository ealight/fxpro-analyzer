import { useLang } from '../contexts/LangContext'

function Section({ title, children }) {
  return (
    <div className="card mb-4">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body" style={{ lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}

function Q({ q, children }) {
  return (
    <div className="mb-4">
      <div className="fw-semibold mb-1" style={{ color: 'var(--accent)' }}>{q}</div>
      <div>{children}</div>
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="table-responsive mt-2">
      <table className="table table-dark table-hover mb-0" style={{ fontSize: '.85rem' }}>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function CodeBlock({ children }) {
  return (
    <div className="mt-2 p-3 rounded" style={{ background: 'var(--surface-2)', fontFamily: 'Consolas, monospace', fontSize: '.82rem', whiteSpace: 'pre' }}>
      {children}
    </div>
  )
}

export default function FAQ() {
  const { lang, t } = useLang()
  const uk = lang === 'uk'

  return (
    <>
      <div className="page-header">
        <h2><i className="bi bi-question-circle me-2 text-accent"></i>{t('faq.title')}</h2>
      </div>
      <div className="page-body">
        <div className="row justify-content-center">
          <div className="col-xl-9">

            {/* ── Core concepts ─────────────────────────────── */}
            <Section title={t('faq.core')}>
              <Q q={uk ? 'Що таке піп?' : 'What is a pip?'}>
                {uk ? (
                  <>
                    <strong>Піп</strong> (Price Interest Point) — це найменша стандартизована одиниця зміни ціни торгового інструменту.
                    Трейдери використовують піпи для вимірювання відстані між двома цінами, розрахунку прибутку/збитку та розміру позиції.
                    <br /><br />
                    Приклад: EUR/USD зміщується з <code>1.10000</code> до <code>1.10010</code> — це рух на <strong>1 піп</strong>.
                  </>
                ) : (
                  <>
                    A <strong>pip</strong> (Price Interest Point) is the smallest standardised unit of price movement for a trading instrument.
                    Traders use pips to measure how far a price has moved, calculate profit/loss, and size their positions.
                    <br /><br />
                    Example: EUR/USD moves from <code>1.10000</code> to <code>1.10010</code> — that is a <strong>1 pip</strong> move.
                  </>
                )}
              </Q>

              <Q q={uk ? 'Що таке розмір піпа?' : 'What is pip size?'}>
                {uk ? (
                  <>
                    <strong>Розмір піпа</strong> — це десяткове значення, яке дорівнює 1 піпу для конкретного інструменту.
                    <Table
                      headers={['Інструмент', 'Розмір піпа', 'Приклад руху', 'Піпи']}
                      rows={[
                        ['EUR/USD, GBP/USD', '0.0001', '1.10000 → 1.10050', '50'],
                        ['USD/JPY, EUR/JPY', '0.01', '155.00 → 155.50', '50'],
                        ['XAU/USD (Золото)', '0.01', '4150.00 → 4152.50', '250'],
                        ['NAS100, US30', '1.0', '20000 → 20050', '50'],
                        ['OIL, BRENT', '0.01', '80.00 → 80.50', '50'],
                        ['BTC/USD', '1.0', '60000 → 60100', '100'],
                      ]}
                    />
                    <div className="mt-2 text-muted" style={{ fontSize: '.83rem' }}>
                      Формула: <code>піпи = відстань ціни / розмір піпа</code>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>Pip size</strong> is the decimal value that equals exactly 1 pip for a given instrument.
                    <Table
                      headers={['Instrument', 'Pip Size', 'Example move', 'Pips']}
                      rows={[
                        ['EUR/USD, GBP/USD', '0.0001', '1.10000 → 1.10050', '50'],
                        ['USD/JPY, EUR/JPY', '0.01', '155.00 → 155.50', '50'],
                        ['XAU/USD (Gold)', '0.01', '4150.00 → 4152.50', '250'],
                        ['NAS100, US30', '1.0', '20000 → 20050', '50'],
                        ['OIL, BRENT', '0.01', '80.00 → 80.50', '50'],
                        ['BTC/USD', '1.0', '60000 → 60100', '100'],
                      ]}
                    />
                    <div className="mt-2 text-muted" style={{ fontSize: '.83rem' }}>
                      Formula: <code>pips = price distance / pip size</code>
                    </div>
                  </>
                )}
              </Q>

              <Q q={uk ? 'Що таке вартість піпа?' : 'What is pip value?'}>
                {uk ? (
                  <>
                    <strong>Вартість піпа</strong> — скільки доларів США коштує один піп при торгівлі <strong>1 стандартним лотом</strong>.
                    Для інструментів, де долар є валютою котирування, формула точна:{' '}
                    <code>вартість піпа = розмір контракту × розмір піпа</code>.<br />
                    Для інструментів в інших валютах (JPY, GBP, EUR) — значення наближені і залежать від поточного курсу.
                    <Table
                      headers={['Інструмент', 'Розмір контракту', 'Розмір піпа', 'Вартість піпа / лот']}
                      rows={[
                        ['EUR/USD, GBP/USD', '100,000', '0.0001', '$10.00'],
                        ['USD/JPY (прибл.)', '100,000', '0.01', '~$9.09'],
                        ['XAU/USD', '100 oz', '0.01', '$1.00'],
                        ['XAG/USD', '5,000 oz', '0.001', '$5.00'],
                        ['NAS100, US30', '10', '1.0', '$10.00'],
                        ['SPX500', '10', '0.1', '$1.00'],
                        ['GER40 (прибл.)', '10', '1.0', '~$11.00'],
                        ['UK100 (прибл.)', '10', '1.0', '~$13.00'],
                        ['OIL, BRENT', '100 бар.', '0.01', '$1.00'],
                        ['BTC/USD', '1 BTC', '1.0', '$1.00'],
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <strong>Pip value</strong> is how many US dollars one pip movement is worth when trading <strong>1 standard lot</strong>.
                    For USD-quoted instruments: <code>pip value = contract size × pip size</code>.<br />
                    For non-USD-quoted pairs (JPY, GBP, EUR) the value fluctuates with the exchange rate — the defaults are approximations.
                    <Table
                      headers={['Instrument', 'Contract Size', 'Pip Size', 'Pip Value / lot']}
                      rows={[
                        ['EUR/USD, GBP/USD', '100,000', '0.0001', '$10.00'],
                        ['USD/JPY (approx.)', '100,000', '0.01', '~$9.09'],
                        ['XAU/USD', '100 oz', '0.01', '$1.00'],
                        ['XAG/USD', '5,000 oz', '0.001', '$5.00'],
                        ['NAS100, US30', '10', '1.0', '$10.00'],
                        ['SPX500', '10', '0.1', '$1.00'],
                        ['GER40 (approx.)', '10', '1.0', '~$11.00'],
                        ['UK100 (approx.)', '10', '1.0', '~$13.00'],
                        ['OIL, BRENT', '100 bbl', '0.01', '$1.00'],
                        ['BTC/USD', '1 BTC', '1.0', '$1.00'],
                      ]}
                    />
                  </>
                )}
              </Q>

              <Q q={uk ? 'Що таке розмір контракту?' : 'What is contract size?'}>
                {uk ? (
                  <>
                    <strong>Розмір контракту</strong> — кількість базового активу, яку представляє 1 стандартний лот. Встановлюється брокером.
                    <ul className="mb-0 mt-2">
                      <li><strong>Форекс:</strong> 1 лот = 100,000 одиниць базової валюти</li>
                      <li><strong>XAU/USD:</strong> 1 лот = 100 тройських унцій золота</li>
                      <li><strong>XAG/USD:</strong> 1 лот = 5,000 тройських унцій срібла</li>
                      <li><strong>Індекси (NAS100, US30 тощо):</strong> 1 лот = 10 одиниць індексу (FxPro)</li>
                      <li><strong>OIL / BRENT:</strong> 1 лот = 100 барелів</li>
                      <li><strong>BTC/USD:</strong> 1 лот = 1 Bitcoin</li>
                    </ul>
                    <br />
                    Завжди перевіряйте специфікацію символу у вашій платформі (MT4/MT5: правий клік на символі → Специфікація).
                  </>
                ) : (
                  <>
                    <strong>Contract size</strong> is the quantity of the underlying asset that one standard lot represents. It is set by the broker.
                    <ul className="mb-0 mt-2">
                      <li><strong>Forex:</strong> 1 lot = 100,000 units of the base currency</li>
                      <li><strong>XAU/USD:</strong> 1 lot = 100 troy ounces of gold</li>
                      <li><strong>XAG/USD:</strong> 1 lot = 5,000 troy ounces of silver</li>
                      <li><strong>Indices (NAS100, US30, etc.):</strong> 1 lot = 10 index units (FxPro default)</li>
                      <li><strong>OIL / BRENT:</strong> 1 lot = 100 barrels</li>
                      <li><strong>BTC/USD:</strong> 1 lot = 1 Bitcoin</li>
                    </ul>
                    <br />
                    Always verify your broker's exact contract size in the platform symbol specification
                    (MT4/MT5: right-click symbol → Specification).
                  </>
                )}
              </Q>

              <Q q={uk ? 'Як розраховується розмір лота?' : 'How is lot size calculated?'}>
                {uk ? (
                  <>
                    Калькулятор використовує таку формулу:<br /><br />
                    <code>лот = сума ризику ($) / (відстань SL у піпах × вартість піпа)</code><br /><br />
                    де <code>сума ризику = депозит × ризик%</code>.<br /><br />
                    Приклад: депозит $10,000, ризик 1%, SL 50 піпів на EUR/USD ($10/піп):<br />
                    <code>лот = (10,000 × 0.01) / (50 × 10) = 100 / 500 = 0.20 лота</code>
                  </>
                ) : (
                  <>
                    The calculator uses this formula:<br /><br />
                    <code>lot = risk amount ($) / (SL distance in pips × pip value)</code><br /><br />
                    Where <code>risk amount = deposit × risk%</code>.<br /><br />
                    Example: $10,000 deposit, 1% risk, 50-pip SL on EUR/USD ($10/pip):<br />
                    <code>lot = (10,000 × 0.01) / (50 × 10) = 100 / 500 = 0.20 lots</code>
                  </>
                )}
              </Q>
            </Section>

            {/* ── Parsing Calculator ────────────────────────── */}
            <Section title={t('faq.parsingSection')}>
              <Q q={uk ? 'Що таке Калькулятор сигналів?' : 'What is the Parsing Calculator?'}>
                {uk
                  ? 'Калькулятор сигналів зчитує текст торгового сигналу (який ви копіюєте з Telegram або аналітичного поста) і автоматично визначає напрямок, інструмент, рівні входу, стоп-лосс та тейк-профіти. Нічого не потрібно вводити вручну — просто вставте і обчислюйте.'
                  : 'The Parsing Calculator reads a raw trading signal (the text you copy from a Telegram channel or analyst post) and automatically extracts the direction, instrument, entry range, stop loss, and take profit levels. You do not need to type anything manually — just paste and calculate.'}
              </Q>

              <Q q={uk ? 'Покрокова інструкція' : 'Step-by-step'}>
                <ol className="mb-0">
                  {uk ? <>
                    <li className="mb-2"><strong>Вставте сигнал</strong> у текстове поле.</li>
                    <li className="mb-2"><strong>Вкажіть депозит та ризик %.</strong> За замовчуванням підставляються значення з Налаштувань.</li>
                    <li className="mb-2"><strong>Оберіть кількість позицій</strong> (1 / 2 / 4 / 8) для розподілу лота між кількома входами.</li>
                    <li className="mb-2"><strong>Скоригуйте специфікацію інструменту</strong> (Розмір контракту, Розмір піпа, Вартість піпа) за потреби — поля заповнюються автоматично після парсингу.</li>
                    <li className="mb-2"><strong>Натисніть «{t('calc.parseBtn')}».</strong> На панелі результатів з'являться: розмір лота, сума ризику, таблиця TP з R:R, таблиця поділу позицій та беззбитковість.</li>
                    <li><strong>Збережіть до Журналу</strong>, якщо потрібно.</li>
                  </> : <>
                    <li className="mb-2"><strong>Paste your signal</strong> into the text area.</li>
                    <li className="mb-2"><strong>Set your deposit and risk %.</strong> These default to your Settings values but can be overridden per calculation.</li>
                    <li className="mb-2"><strong>Choose split positions</strong> (1 / 2 / 4 / 8) to distribute the total lot across multiple entries.</li>
                    <li className="mb-2"><strong>Adjust instrument specs</strong> (Contract Size, Pip Size, Pip Value) if needed — they auto-fill after parsing.</li>
                    <li className="mb-2"><strong>Click Parse &amp; Calculate.</strong> The results panel shows lot size, risk amount, TP table with R:R ratios, position split table, and break-even info.</li>
                    <li><strong>Save to Journal</strong> to record the trade.</li>
                  </>}
                </ol>
              </Q>

              <Q q={uk ? 'Які формати сигналів підтримуються?' : 'What signal formats are supported?'}>
                {uk
                  ? 'Парсер гнучкий і розпізнає більшість поширених форматів:'
                  : 'The parser is flexible and handles most common formats:'}
                <CodeBlock>{`BUY XAU/USD\nEntry: 4150 - 4154.6\nSL: 4136\nTP1: 4159.2\nTP2: 4166.1\nTP3: 4180\n\nSELL EURUSD @ 1.0850\nStop loss: 1.0890\nTake profit: 1.0800`}</CodeBlock>
                {uk
                  ? 'Псевдоніми інструментів розпізнаються автоматично (напр. XAUUSD → XAU/USD, GOLD → XAU/USD, NQ → NAS100, DOW → US30).'
                  : 'Instrument aliases are recognised automatically (e.g. XAUUSD → XAU/USD, GOLD → XAU/USD, NQ → NAS100, DOW → US30).'}
              </Q>
            </Section>

            {/* ── Manual Calculator ─────────────────────────── */}
            <Section title={t('faq.manualSection')}>
              <Q q={uk ? 'Що таке Калькулятор (вручну)?' : 'What is the Manual Calculator?'}>
                {uk
                  ? 'Калькулятор (вручну) ідентичний до Калькулятора сигналів за результатами, але всі параметри угоди ви вводите самостійно через форму. Використовуйте його, коли маєте конкретні рівні, але немає форматованого тексту сигналу.'
                  : 'The Manual Calculator is identical to the Parsing Calculator in terms of results, but you fill in all trade parameters yourself. Use it when you have price levels in mind but no formatted signal text.'}
              </Q>

              <Q q={uk ? 'Покрокова інструкція' : 'Step-by-step'}>
                <ol className="mb-0">
                  {uk ? <>
                    <li className="mb-2"><strong>Оберіть Напрямок</strong> — BUY або SELL.</li>
                    <li className="mb-2"><strong>Оберіть Інструмент</strong> — поля специфікації заповняться автоматично.</li>
                    <li className="mb-2"><strong>Введіть Ціну входу</strong> та <strong>Стоп-лосс</strong>. Для BUY угод SL має бути нижче входу, для SELL — вище.</li>
                    <li className="mb-2"><strong>Додайте рівні тейк-профіту</strong> за допомогою кнопки «{t('calc.addTp')}». До 8 рівнів. Поля TP необов'язкові — розрахунок лота залежить лише від входу та SL.</li>
                    <li className="mb-2"><strong>Скоригуйте специфікацію інструменту</strong>, якщо ваш брокер відрізняється від налаштувань за замовчуванням.</li>
                    <li className="mb-2"><strong>Вкажіть Депозит, Ризик % та Поділ позицій.</strong></li>
                    <li><strong>Натисніть «{t('calc.calcBtn')}»</strong> і збережіть до Журналу за потреби.</li>
                  </> : <>
                    <li className="mb-2"><strong>Select Direction</strong> — BUY or SELL.</li>
                    <li className="mb-2"><strong>Select Instrument</strong> — the spec fields auto-fill from defaults.</li>
                    <li className="mb-2"><strong>Enter Entry Price</strong> and <strong>Stop Loss</strong>. SL must be below entry for BUY and above for SELL.</li>
                    <li className="mb-2"><strong>Add Take Profit levels</strong> with the Add TP button (up to 8). TPs are optional — lot size depends only on entry and SL.</li>
                    <li className="mb-2"><strong>Override instrument specs</strong> if your broker differs from the defaults.</li>
                    <li className="mb-2"><strong>Set Deposit, Risk %, and Split.</strong></li>
                    <li><strong>Click Calculate</strong> and optionally save to the Journal.</li>
                  </>}
                </ol>
              </Q>

              <Q q={uk ? 'Коли потрібно змінювати вартість піпа?' : 'When should I override pip value?'}>
                {uk
                  ? 'Значення вартості піпа для валютних пар JPY, EUR/GBP, GBP/AUD, GER40 та UK100 є наближеними — вони залежать від поточного обмінного курсу і можуть відрізнятися на 10–20%. Для точних розрахунків відкрийте MT4/MT5, перевірте поточну вартість піпа у вкладці «Торгівля» та введіть це значення в калькулятор.'
                  : 'The default pip values for JPY pairs, EUR/GBP, GBP/AUD, GER40, and UK100 are approximations — they depend on the current exchange rate and can be off by 10–20%. For precise calculations, check the current pip value in your MT4/MT5 Trade tab and enter it here.'}
              </Q>
            </Section>

            {/* ── Results ───────────────────────────────────── */}
            <Section title={t('faq.resultsSection')}>
              <Q q={uk ? 'Що означає «Рекомендований лот»?' : 'What does "Recommended Lot" mean?'}>
                {uk
                  ? <>Це точний розмір лота, при якому ви ризикуєте рівно вказаним % депозиту при заданій відстані SL. Якщо значення нижче мінімального лота брокера (0.01), з'являється значок <span className="badge bg-danger">MIN</span> і використовується мінімальний лот — фактичний ризик при цьому буде вищим за заплановий.</>
                  : <>This is the exact lot size that risks exactly your specified % of deposit given the SL distance. If it is below the broker's minimum lot (0.01), a <span className="badge bg-danger">MIN</span> badge appears and the minimum lot is used — meaning your actual risk will be higher than intended.</>}
              </Q>

              <Q q={uk ? 'Що таке R:R (ризик до прибутку)?' : 'What is R:R (Risk to Reward)?'}>
                {uk
                  ? 'R:R — відношення потенційного прибутку до потенційного збитку. Значення 1:2 означає, що ви ризикуєте $1, щоб заробити $2. Таблиця показує R:R для кожного рівня TP. Більшість трейдерів націлюються на мінімальний R:R 1:1.5 або 1:2.'
                  : 'R:R is the ratio of potential profit to potential loss. 1:2 means you risk $1 to make $2. The table shows R:R for each TP level. Traders commonly target a minimum R:R of 1:1.5 or 1:2.'}
              </Q>

              <Q q={uk ? 'Що таке розділ «Беззбитковість»?' : 'What is the Break Even section?'}>
                {uk ? (
                  <>Після досягнення TP1 ви можете перемістити стоп-лосс у точку входу (беззбитковість). Панель показує:
                    <ul className="mb-0 mt-1">
                      <li><strong>Зафіксований прибуток після TP1</strong> — прибуток, закріплений після закриття TP1.</li>
                      <li><strong>Залишковий ризик після BE</strong> — після переміщення SL у точку входу решта позицій не ризикує початковим капіталом ($0).</li>
                    </ul>
                  </>
                ) : (
                  <>After TP1 is hit you can move your stop loss to entry (break even). The panel shows:
                    <ul className="mb-0 mt-1">
                      <li><strong>Locked profit after TP1</strong> — the profit secured when TP1 closes.</li>
                      <li><strong>Remaining risk after BE</strong> — once SL is at entry, remaining positions risk $0 on original capital.</li>
                    </ul>
                  </>
                )}
              </Q>

              <Q q={uk ? 'Що означає «Поділ позицій»?' : 'What does "Position Split" mean?'}>
                {uk
                  ? 'При виборі 2, 4 або 8 позицій загальний лот рівномірно розподіляється між кількома окремими угодами. Кожна позиція цілиться в свій рівень TP (Позиція 1 → TP1, Позиція 2 → TP2 тощо). Це дозволяє частково фіксувати прибуток на кожному TP, залишаючи решту позицій відкритими.'
                  : 'When you choose 2, 4, or 8 split positions, the total lot is divided equally across that many separate trades. Each position targets a successive TP level (Position 1 → TP1, Position 2 → TP2, etc.). This lets you partially close at each TP while letting remaining positions run further.'}
              </Q>
            </Section>

          </div>
        </div>
      </div>
    </>
  )
}
