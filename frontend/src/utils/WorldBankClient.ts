const INDICATORS = {
    CPI: 'FP.CPI.TOTL',
    FOOD: 'FP.CPI.FOOD',
    INFLATION: 'FP.CPI.TOTL.ZG'
};

const WorldBankClient = {
    async getIndicatorData(countryCode: string, indicator: keyof typeof INDICATORS) {
        try {
            const code = INDICATORS[indicator];
            const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${code}?format=json&per_page=24`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('WB API error');
            const data = await res.json();

            // Data is in data[1]
            if (!data || !data[1]) return [];

            return data[1].map((entry: any) => ({
                date: entry.date,
                value: entry.value,
                indicator: entry.indicator?.value
            })).filter((e: any) => e.value !== null);
        } catch (e) {
            console.error('World Bank fetch failed:', e);
            return [];
        }
    },

    async getCountrySummary(countryCode: string) {
        const [cpi, food, inflation] = await Promise.all([
            this.getIndicatorData(countryCode, 'CPI'),
            this.getIndicatorData(countryCode, 'FOOD'),
            this.getIndicatorData(countryCode, 'INFLATION')
        ]);

        return {
            cpi: cpi[0], // Latest
            food: food[0],
            inflation: inflation[0],
            history: { cpi, food, inflation }
        };
    }
};

export default WorldBankClient;
