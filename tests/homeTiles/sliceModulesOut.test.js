import {sliceModulesOut, filterBadgeEarnModules, filterBadgeClaimModules} from '../../src/toolbox/sliceModulesOut';


describe("sliceModulesOut", () => {

    const earnItModules = [{ name: "Badge 1 - How Do I Earn It?"}];
    const claimBadgeModules = [{ name: "Claim Badge 1 - Godzilla Expert"}];
    const weeklyModules = [
            { name: "Module 1"},
            { name: "Module 2"},
            { name: "Week 3"},
    ];

    it("Removes elements and returns two lists", () => {
        const original = [
            1, 2, 3, 4
        ]
        expect(sliceModulesOut(original, (x) => x >= 3)).toEqual({
            remaining: [1, 2],
            removed: [3, 4]
        });
    })

    it('filters earned it modules out correctly', () => {
        const original = [
            ...weeklyModules,
            ...earnItModules,
        ]

        const { remaining, removed } = sliceModulesOut(original, filterBadgeEarnModules);
        expect(remaining).toEqual(weeklyModules);
        expect(removed).toEqual(earnItModules);
    })
    it('filters claim modules out correctly', () => {
        const original = [
            ...weeklyModules,
            ...claimBadgeModules,
        ]

        const { remaining, removed } = sliceModulesOut(original, filterBadgeClaimModules);
        expect(remaining).toEqual(weeklyModules);
        expect(removed).toEqual(claimBadgeModules);
    })

    it('filters both earned it and claimed out', () => {
        const original = [
            ...weeklyModules,
            ...earnItModules,
            ...claimBadgeModules,
        ]

        const { remaining, removed } = sliceModulesOut(original, {
            claimIt: filterBadgeClaimModules,
            earnIt: filterBadgeEarnModules,
        });
        expect(remaining).toEqual(weeklyModules);
        expect(removed).toEqual({
            earnIt: earnItModules,
            claimIt: claimBadgeModules,
        });


    })

});