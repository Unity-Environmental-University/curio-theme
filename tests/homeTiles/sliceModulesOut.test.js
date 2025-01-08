import { sliceModulesOut, filterBadgeEarnModules } from '../../src/toolbox/sliceModulesOut';


describe("sliceModulesOut", () => {

    const earnItBadges = [{ name: "Badge 1 - How Do I Earn It?"}];
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
            ...earnItBadges,
        ]

        const { remaining, removed } = sliceModulesOut(original, filterBadgeEarnModules);
        expect(remaining).toEqual(weeklyModules);
        expect(removed).toEqual(earnItBadges);
    })
});