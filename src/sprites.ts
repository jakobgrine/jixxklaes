interface SpriteCollection<T> {
    still: T;
    walking: T[];
    jumping: T;
    ground: T;
}

const SPRITE_SOURCES: SpriteCollection<URL> = {
    still: new URL("sprite/still.png", import.meta.url),
    walking: [
        new URL("sprite/walking_1.png", import.meta.url),
        new URL("sprite/walking_2.png", import.meta.url),
        new URL("sprite/walking_3.png", import.meta.url),
        new URL("sprite/walking_4.png", import.meta.url),
    ],
    jumping: new URL("sprite/jumping.png", import.meta.url),
    ground: new URL("sprite/ground.png", import.meta.url),
};

function loadImage(url: URL | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => resolve(image);
        image.src = url.toString();
    });
}

async function injectSpriteSources(sources: SpriteCollection<URL>) {
    // Load all sprites
    const promises = [];
    let sprites: SpriteCollection<HTMLImageElement> = {
        ground: undefined,
        jumping: undefined,
        walking: [],
        still: undefined,
    };
    for (const key of Object.keys(sources)) {
        if (Array.isArray(sources[key])) {
            for (let i = 0; i < sources[key].length; i++) {
                promises.push(
                    loadImage(sources[key][i]).then(
                        (image) => (sprites[key][i] = image),
                    ),
                );
            }
        } else {
            promises.push(
                loadImage(sources[key]).then((image) => (sprites[key] = image)),
            );
        }
    }
    await Promise.all(promises);
    return sprites;
}

export let SPRITES: SpriteCollection<HTMLImageElement>;

export async function loadSprites() {
    SPRITES = await injectSpriteSources(SPRITE_SOURCES);
}
