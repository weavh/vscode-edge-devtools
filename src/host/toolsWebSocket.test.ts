// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { getFirstCallback } from "../test/helpers";

describe("toolsWebSocket", () => {
    let mockWebviewEvents: { encodeMessageForChannel: jest.Mock };

    beforeEach(() => {
        mockWebviewEvents = {
            encodeMessageForChannel: jest.fn(),
        };
        jest.doMock("../common/webviewEvents", () => mockWebviewEvents);
        jest.resetModules();

        window.parent.postMessage = jest.fn();
    });

    describe("constructor", () => {
        it("updates instance property", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");

            const websocket = new toolsWebSocket("some url");
            expect(toolsWebSocket.instance).toEqual(websocket);

            const websocket2 = new toolsWebSocket("some other url");
            expect(toolsWebSocket.instance).toEqual(websocket2);
        });

        it("sends ready event", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");
            const websocket = new toolsWebSocket("some url");
            expect(websocket).toBeDefined();

            expect(mockWebviewEvents.encodeMessageForChannel).toHaveBeenCalledWith(
                expect.any(Function),
                "ready",
            );

            const expectedPostedMessage = "encodedMessage";
            const postMessage = getFirstCallback(mockWebviewEvents.encodeMessageForChannel);
            postMessage.callback.call(postMessage.thisObj, expectedPostedMessage);
            expect(window.parent.postMessage).toHaveBeenCalledWith(expectedPostedMessage, "*");
        });
    });

    describe("send", () => {
        it("forwards messages correctly", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");
            const websocket = new toolsWebSocket("some url");
            mockWebviewEvents.encodeMessageForChannel.mockClear();

            const expectedMessage = "some message string";
            websocket.send(expectedMessage);
            expect(mockWebviewEvents.encodeMessageForChannel).toHaveBeenCalledWith(
                expect.any(Function),
                "websocket",
                { message: expectedMessage },
            );

            const expectedPostedMessage = "encodedMessage";
            const postMessage = getFirstCallback(mockWebviewEvents.encodeMessageForChannel);
            postMessage.callback.call(postMessage.thisObj, expectedPostedMessage);
            expect(window.parent.postMessage).toHaveBeenCalledWith(expectedPostedMessage, "*");
        });
    });

    describe("onMessageFromChannel", () => {
        it("parses control messages and calls correct handlers", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");
            const websocket = new toolsWebSocket("some url");

            const mockHandler = jest.fn();

            websocket.onerror = mockHandler;
            websocket.onMessageFromChannel("error");
            expect(mockHandler).toBeCalled();

            mockHandler.mockClear();
            websocket.onerror = undefined;
            websocket.onMessageFromChannel("error");
            expect(mockHandler).not.toBeCalled();

            websocket.onopen = mockHandler;
            websocket.onMessageFromChannel("open");
            expect(mockHandler).toBeCalled();

            mockHandler.mockClear();
            websocket.onopen = undefined;
            websocket.onMessageFromChannel("open");
            expect(mockHandler).not.toBeCalled();

            websocket.onclose = mockHandler;
            websocket.onMessageFromChannel("close");
            expect(mockHandler).toBeCalled();

            mockHandler.mockClear();
            websocket.onclose = undefined;
            websocket.onMessageFromChannel("close");
            expect(mockHandler).not.toBeCalled();
        });

        it("forwards websocket messages to onmessage", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");
            const websocket = new toolsWebSocket("some url");

            websocket.onmessage = jest.fn();

            const expectedMessage = "{ request: 1 }";
            websocket.onMessageFromChannel("message", expectedMessage);
            expect(websocket.onmessage).toBeCalledWith({ data: expectedMessage });

            const expectedMessage2 = `{ name: "my Name" }`;
            websocket.onMessageFromChannel("message", expectedMessage2);
            expect(websocket.onmessage).toBeCalledWith({ data: expectedMessage2 });
        });

        it("ignores websocket messages with no message data", async () => {
            const { default: toolsWebSocket } = await import("./toolsWebSocket");
            const websocket = new toolsWebSocket("some url");

            websocket.onmessage = jest.fn();

            (websocket.onmessage as jest.Mock).mockClear();
            websocket.onMessageFromChannel("message");
            expect(websocket.onmessage).not.toBeCalled();
        });
    });
});
