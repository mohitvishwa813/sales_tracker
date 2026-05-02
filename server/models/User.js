const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'VIP' }
}, { timestamps: true });

// Hash password before saving - Using async without next() for Mongoose 8 compliance
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    try {
        console.log('Hashing password for user:', this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
    } catch (err) {
        console.error('Password Hashing Failed:', err.message);
        throw err; // In async hooks, throwing an error is the same as calling next(err)
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err;
    }
};

module.exports = mongoose.model('User', UserSchema);
