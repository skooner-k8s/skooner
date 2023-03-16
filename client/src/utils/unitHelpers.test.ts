import {
    parseDiskSpace,
    parseRam,
    parseUnitsOfRam,
    unparseRam,
    parseCpu,
    unparseCpu,
} from './unitHelpers';

describe('parseDiskSpace', () => {
    it('returns 0 when given no value', () => {
        expect(parseDiskSpace()).toEqual(0);
        expect(parseDiskSpace('')).toEqual(0);
    });

    it('correctly handles Mebibyte derivatives', () => {
        expect(parseDiskSpace('')).toEqual(0);
        expect(parseDiskSpace('1Bi')).toEqual(1);
        expect(parseDiskSpace('1Ki')).toEqual(1024);
        expect(parseDiskSpace('1Mi')).toEqual(1048576);
        expect(parseDiskSpace('1Gi')).toEqual(1073741824);
        expect(parseDiskSpace('1Ti')).toEqual(1099511627776);
        expect(parseDiskSpace('1Pi')).toEqual(1125899906842624);
        expect(parseDiskSpace('1Ei')).toEqual(1152921504606847000);
    });

    it('correctly handles MegaBytes derivatives including milibytes', () => {
        expect(parseDiskSpace('')).toEqual(0);
        expect(parseDiskSpace('1m')).toEqual(0.001);
        expect(parseDiskSpace('1000m')).toEqual(1);
        expect(parseDiskSpace('1B')).toEqual(1);
        expect(parseDiskSpace('1K')).toEqual(1000);
        expect(parseDiskSpace('1M')).toEqual(1000000);
        expect(parseDiskSpace('1G')).toEqual(1000000000);
        expect(parseDiskSpace('1T')).toEqual(1000000000000);
        expect(parseDiskSpace('1P')).toEqual(1000000000000000);
        expect(parseDiskSpace('1E')).toEqual(1000000000000000000);
    });

    it('ignores additional chars when parsing units', () => {
        expect(parseDiskSpace('1Gb')).toEqual(parseDiskSpace('1G'));
    });
});

describe('parseRam', () => {
    it('returns 0 when given no value', () => {
        expect(parseRam()).toEqual(0);
        expect(parseRam('')).toEqual(0);
    });

    it('correctly handles MegaBytes derivatives including milibytes', () => {
        expect(parseRam('1Bi')).toEqual(1);
        expect(parseRam('1Ki')).toEqual(1024);
        expect(parseRam('1Mi')).toEqual(1048576);
        expect(parseRam('1Gi')).toEqual(1073741824);
        expect(parseRam('1Ti')).toEqual(1099511627776);
        expect(parseRam('1Pi')).toEqual(1125899906842624);
        expect(parseRam('1Ei')).toEqual(1152921504606847000);
    });
    it('correctly handles MegaBytes usage - including milibytes', () => {
        expect(parseRam('1m')).toEqual(0.001);
        expect(parseRam('1000m')).toEqual(1);
        expect(parseRam('1B')).toEqual(1);
        expect(parseRam('1K')).toEqual(1000);
        expect(parseRam('1M')).toEqual(1000000);
        expect(parseRam('1G')).toEqual(1000000000);
        expect(parseRam('1T')).toEqual(1000000000000);
        expect(parseRam('1P')).toEqual(1000000000000000);
        expect(parseRam('1E')).toEqual(1000000000000000000);
    });

    it('fixes specific issue #395 - RAM Request/Limits calculation is incorrect', () => {
        const bytes = parseRam('1503238553600m');
        const unitValue = unparseRam(bytes);
        expect(unitValue).toEqual({unit: 'Gi', value: 1.4});
    });

    it('ignores additional chars when parsing units', () => {
        expect(parseRam('1Gb')).toEqual(parseRam('1G'));
    });
});

describe('parseUnitsOfRam', () => {
    it('returns undefined when given no bytes', () => {
        expect(parseUnitsOfRam()).toBeUndefined();
        expect(parseUnitsOfRam(undefined)).toBeUndefined();
        expect(parseUnitsOfRam(0)).toBeUndefined();
    });

    it('should return the correct value and unit for bytes input', () => {
        const bytes = 1500;
        expect(parseUnitsOfRam(bytes)).toEqual({value: 1.5, unit: 'Kb'});
    });

    it('parseUnitsOfRam basic usage', () => {
        expect(parseUnitsOfRam(1_000)).toEqual({value: 1, unit: 'Kb'});
        expect(parseUnitsOfRam(1_000_000)).toEqual({value: 1, unit: 'Mb'});
        expect(parseUnitsOfRam(1_000_000_000)).toEqual({value: 1, unit: 'Gb'});
        expect(parseUnitsOfRam(1_000_000_000_000)).toEqual({value: 1, unit: 'Tb'});
    });

    it('parseUnitsOfRam #188 use case', () => {
        expect(parseUnitsOfRam(473_300_000_000)).toEqual({value: 473.3, unit: 'Gb'});
        expect(parseUnitsOfRam(3_000_000_000_000)).toEqual({value: 3, unit: 'Tb'});
    });

    it('parseUnitsOfRam with explicit targetUnit', () => {
        expect(parseUnitsOfRam(473_300_000_000, 'T')).toEqual({value: 0.47, unit: 'Tb'});
        expect(parseUnitsOfRam(473_300_000_000, 'Tb')).toEqual({value: 0.47, unit: 'Tb'});
        expect(parseUnitsOfRam(3_500_000_000_000)).toEqual({value: 3.5, unit: 'Tb'});
    });

    it('parseUnitsOfRam #188 fixed use case', () => {
        const available = parseUnitsOfRam(3_500_000_000_000);
        const used = parseUnitsOfRam(473_300_000_000, available?.unit);
        expect(used).toEqual({value: 0.47, unit: 'Tb'});
    });
});

describe('unparseRam', () => {
    it('should correctly unparse RAM values', () => {
        expect(unparseRam(1)).toEqual({value: 1, unit: 'Bi'});
        expect(unparseRam(1000)).toEqual({value: 1000, unit: 'Bi'});
        expect(unparseRam(1024)).toEqual({value: 1, unit: 'Ki'});
        expect(unparseRam(1024 * 1024)).toEqual({value: 1, unit: 'Mi'});
        expect(unparseRam(1024 * 1024 * 1024)).toEqual({value: 1, unit: 'Gi'});
        expect(unparseRam(1024 * 1024 * 1024 * 1024)).toEqual({value: 1, unit: 'Ti'});
        expect(unparseRam(1024 * 1024 * 1024 * 1024 * 1024)).toEqual({value: 1, unit: 'Pi'});
        expect(unparseRam(1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toEqual({value: 1, unit: 'Ei'});
        expect(unparseRam(1536)).toEqual({value: 1.5, unit: 'Ki'});
        expect(unparseRam(12345678)).toEqual({value: 11.8, unit: 'Mi'});
    });
});

describe('parseCpu', () => {
    it('should correctly parse CPU values', () => {
        expect(parseCpu('0')).toEqual(0);
        expect(parseCpu('1n')).toEqual(1);
        expect(parseCpu('1u')).toEqual(1000);
        expect(parseCpu('1m')).toEqual(1000000);
        expect(parseCpu('1')).toEqual(1000000000);
    });
});

describe('unparseCpu', () => {
    it('should correctly unparse CPU values', () => {
        expect(unparseCpu(0)).toEqual({value: 0, unit: 'm'});
        expect(unparseCpu(1000 * 10)).toEqual({value: 0.01, unit: 'm'});
        expect(unparseCpu(1000000000 / 10)).toEqual({value: 100, unit: 'm'});
        expect(unparseCpu(1000000000)).toEqual({value: 1000, unit: 'm'});
        expect(unparseCpu(1000000000 * 10)).toEqual({value: 10000, unit: 'm'});
    });
});
