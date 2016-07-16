module.exports = {
    id: {
        presence: true
    },
    type: {
        presence: true,
            inclusion: {
            within: ['intersection', 'stopline', 'freeeway', 'point', 'bottleneck', 'conflictingApproach', 'entranceRamp'],
                message: "^ Node type not supported"
        }
    }
};