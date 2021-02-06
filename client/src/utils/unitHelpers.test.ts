import {parseUnitsOfRam} from './unitHelpers';

describe('unitHelpers', () => {
    test('parseUnitsOfRam basic usage', () => {
        expect(parseUnitsOfRam(1_000)).toEqual({value: 1, unit: 'Kb'});
        expect(parseUnitsOfRam(1_000_000)).toEqual({value: 1, unit: 'Mb'});
        expect(parseUnitsOfRam(1_000_000_000)).toEqual({value: 1, unit: 'Gb'});
        expect(parseUnitsOfRam(1_000_000_000_000)).toEqual({value: 1, unit: 'Tb'});
    });

    test('parseUnitsOfRam #188 use case', () => {
        expect(parseUnitsOfRam(473_300_000_000)).toEqual({value: 473.3, unit: 'Gb'});
        expect(parseUnitsOfRam(3_000_000_000_000)).toEqual({value: 3, unit: 'Tb'});
    });

    test('parseUnitsOfRam with explicit targetUnit', () => {
        expect(parseUnitsOfRam(473_300_000_000, 'T')).toEqual({value: 0.47, unit: 'Tb'});
        expect(parseUnitsOfRam(473_300_000_000, 'Tb')).toEqual({value: 0.47, unit: 'Tb'});
        expect(parseUnitsOfRam(3_500_000_000_000)).toEqual({value: 3.5, unit: 'Tb'});
    });

    test('parseUnitsOfRam #188 fixed use case', () => {
        const available = parseUnitsOfRam(3_500_000_000_000);
        const used = parseUnitsOfRam(473_300_000_000, available?.unit);
        expect(used).toEqual({value: 0.47, unit: 'Tb'});
    });
});
