export declare class ArabicShapeRenderer {
    private readonly arabicCharTable;
    private readonly alef;
    private readonly alefHamza;
    private readonly alefHamzaBelow;
    private readonly alefMadda;
    private readonly lam;
    private readonly hamza;
    private readonly zeroWidthJoiner;
    private readonly hamzaAbove;
    private readonly hamzaBelow;
    private readonly wawHamza;
    private readonly yehHamza;
    private readonly waw;
    private readonly alefMaksura;
    private readonly yeh;
    private readonly farsiYeh;
    private readonly shadda;
    private readonly madda;
    private readonly lwa;
    private readonly lwawh;
    private readonly lwawhb;
    private readonly lwawm;
    private readonly bwhb;
    private readonly fathatan;
    private readonly superScriptalef;
    private readonly vowel;
    private arabicMapTable;
    constructor();
    private getCharacterShape;
    shape(text: string, level: number): string;
    private doShape;
    private append;
    private ligature;
    private getShapeCount;
}
export declare class ArabicShape {
    private shapeValue;
    private shapeType;
    private shapeVowel;
    private shapeLigature;
    private shapeShapes;
    /**
     * Gets or sets the values.
     * @private
     */
    Value: string;
    /**
     * Gets or sets the values.
     * @private
     */
    Type: string;
    /**
     * Gets or sets the values.
     * @private
     */
    vowel: string;
    /**
     * Gets or sets the values.
     * @private
     */
    Ligature: number;
    /**
     * Gets or sets the values.
     * @private
     */
    Shapes: number;
}
