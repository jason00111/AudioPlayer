export function getAttributes(attributeNames, element) {
    const attributes = {};

    attributeNames.forEach(name => {
        attributes[name] = element.getAttribute(name);
    });

    return attributes;
}

export function checkRequiredAttributes(attributeNames, element) {
    attributeNames.forEach(name => {
        if (element.getAttribute(name) === null) {
            throw new Error(`Required attribute ${name} not found on element ${element.tagName}.`);
        }
    });
}