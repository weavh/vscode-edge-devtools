// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getTextFromFile } from "../../test/helpers";

describe("simpleView", () => {
    it("revealInVSCode calls openInEditor", async () => {
        const apply = await import("./simpleView");
        const expected = {
            columnNumber: 0,
            lineNumber: 0,
            omitFocus: false,
            uiSourceCode: {
                _url: "http://bing.com",
            },
        };
        const mockOpen = jest.fn();
        (global as any).InspectorFrontendHost = {
            openInEditor: mockOpen,
        };

        await apply.revealInVSCode(expected, expected.omitFocus);

        expect(mockOpen).toHaveBeenCalled();
    });

    it("applyCommonRevealerPatch correctly changes text", async () => {
        const comparableText = "let reveal = function(revealable, omitFocus) { // code";
        let fileContents = getTextFromFile("common/Revealer.js");
        if (!fileContents) {
            // The file was not found, so test that at least the text is being replaced.
            fileContents = comparableText;
        }

        const apply = await import("./simpleView");
        const result = apply.applyCommonRevealerPatch(fileContents);
        expect(result).not.toEqual(null);
        expect(result).toEqual(
            expect.stringContaining("let reveal = function revealInVSCode(revealable, omitFocus) {"));
    });

    it("applyInspectorViewPatch correctly changes text", async () => {
        const comparableText = "handleAction(context, actionId) { // code";
        let fileContents = getTextFromFile("ui/InspectorView.js");
        // The file was not found, so test that at least the text is being replaced.
        fileContents = fileContents ? fileContents : comparableText;

        const apply = await import("./simpleView");
        const result = apply.applyInspectorViewPatch(fileContents);
        expect(result).not.toEqual(null);
        expect(result).toEqual(
            expect.stringContaining("handleAction(context, actionId) { return false;"));

        const drawerComparableText = "_showDrawer(focus) { // code";

        // The file was not found, so test that at least the text is being replaced.
        fileContents = fileContents ? fileContents : drawerComparableText;
        const result2 = apply.applyInspectorViewPatch(fileContents);
        expect(result2).not.toEqual(null);
        expect(result2).toEqual(expect.stringContaining("_showDrawer(focus) { return false;"));
    });

    it("applyMainViewPatch correctly changes text", async () => {
        const comparableText = "const moreTools = getExtensions();";
        let fileContents = getTextFromFile("main/MainImpl.js");

        // The file was not found, so test that at least the text is being replaced.
        fileContents = fileContents ? fileContents : comparableText;
        const apply = await import("./simpleView");
        const result = apply.applyMainViewPatch(comparableText);
        expect(result).not.toEqual(null);
        expect(result).toEqual(
            expect.stringContaining("const moreTools = { defaultSection: () => ({ appendItem: () => {} }) };"));
    });

    it("applySelectTabPatch correctly changes text", async () => {
        const comparableText = "selectTab(id, userGesture, forceFocus) { // code";
        let fileContents = getTextFromFile("ui/TabbedPane.js");

        // The file was not found, so test that at least the text is being replaced.
        fileContents = fileContents ? fileContents : comparableText;
        const apply = await import("./simpleView");
        const result = apply.applySelectTabPatch(fileContents);
        expect(result).not.toEqual(null);
        expect(result).toEqual(expect.stringContaining("selectTab(id, userGesture, forceFocus) { if ("));
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-header-contents", async () => {
        const expectedCss = `.main-tabbed-pane .tabbed-pane-header-contents {
            flex: auto;
            pointer-events: none;
            margin-left: 0;
            position: relative;
        }`;
        const expectedResult = `.main-tabbed-pane .tabbed-pane-header-contents {
            display: none !important;
        }`;
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss);
        expect(result === expectedResult).toEqual(true);
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-tab-slider", async () => {
        const expectedCss = `.tabbed-pane-tab-slider {
            height: 2px;
            position: absolute;
            bottom: -1px;
            background-color: var(--accent-color);
            left: 0;
            z-index: 50;
            transform-origin: 0 100%;
            transition: transform 150ms cubic-bezier(0, 0, 0.2, 1);
            visibility: hidden;
        }`;
        const expectedResult = `.tabbed-pane-tab-slider {
            display: none !important;
        }`;
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss);
        expect(result === expectedResult).toEqual(true);
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-right-toolbar", async () => {
        const expectedCss = `.tabbed-pane-right-toolbar {
            margin-left: -4px;
            flex: none;
        }`;
        const expectedResult = `.tabbed-pane-right-toolbar {
            display: none !important;
        }`;
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss);
        expect(result === expectedResult).toEqual(true);
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-header-contents in release mode", async () => {
        const expectedCss = `.main-tabbed-pane .tabbed-pane-header-contents {
            flex: auto;
            pointer-events: none;
            margin-left: 0;
            position: relative;
        }`;
        const expectedResult =
            ".main-tabbed-pane .tabbed-pane-header-contents {\\n            display: none !important;\\n        }";
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss, true);
        expect(result === expectedResult).toEqual(true);
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-tab-slider in release mode", async () => {
        const expectedCss = `.tabbed-pane-tab-slider {
            height: 2px;
            position: absolute;
            bottom: -1px;
            background-color: var(--accent-color);
            left: 0;
            z-index: 50;
            transform-origin: 0 100%;
            transition: transform 150ms cubic-bezier(0, 0, 0.2, 1);
            visibility: hidden;
        }`;
        const expectedResult =
            ".tabbed-pane-tab-slider {\\n            display: none !important;\\n        }";
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss, true);
        expect(result === expectedResult).toEqual(true);
    });

    it("applyInspectorCommonCssPatch correctly changes tabbed-pane-right-toolbar in release mode", async () => {
        const expectedCss = `.tabbed-pane-right-toolbar {
            margin-left: -4px;
            flex: none;
        }`;
        const expectedResult =
            ".tabbed-pane-right-toolbar {\\n            display: none !important;\\n        }";
        const apply = await import("./simpleView");
        const result = apply.applyInspectorCommonCssPatch(expectedCss, true);
        expect(result === expectedResult).toEqual(true);
    });
});
