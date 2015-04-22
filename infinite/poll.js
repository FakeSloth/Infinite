module.exports = (function() {
    var Poll = {
        reset: function(roomId) {
            Poll[roomId] = {
                question: undefined,
                optionList: [],
                options: {},
                display: '',
                topOption: ''
            };
        },

        splint: function(target) {
            var parts = target.split(',');
            var len = parts.length;
            while (len--) {
                parts[len] = parts[len].trim();
            }
            return parts;
        }
    };

    for (var id in Rooms.rooms) {
        if (Rooms.rooms[id].type === 'chat' && !Poll[id]) {
            Poll[id] = {};
            Poll.reset(id);
        }
    }

    return Poll;
})();
