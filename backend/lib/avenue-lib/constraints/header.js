module.exports = {
    id: {
        presence: true
    },
    type: {
        presence: true,
            inclusion: {
            within: ['crossRoad', 'stopline', 'carriageway', 'point', 'bottleneck', 'concurrent', 'concurrentMerge', 'pedestrian'],
                message: "^ Node type not supported"
        }
    }
};