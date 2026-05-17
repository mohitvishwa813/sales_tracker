const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TRIAL_DAYS = 7;

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    phone: {
        type: String,
        required: true,
        trim: true,
        // Indian mobile: 10 digits, starts with 6-9. Stored without country code.
        validate: {
            validator: (v) => /^[6-9]\d{9}$/.test(v),
            message: 'Phone must be a 10-digit Indian mobile number'
        }
    },

    subscriptionState: {
        type: String,
        enum: ['TRIALING', 'ACTIVE', 'INACTIVE', 'PAST_DUE'],
        default: 'TRIALING'
    },
    trialEndsAt: { type: Date },
    currentPeriodEnd: { type: Date },
    lastPaymentAt: { type: Date },
    razorpayCustomerId: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function() {
    if (this.isNew && !this.trialEndsAt) {
        const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        this.trialEndsAt = trialEnd;
        this.currentPeriodEnd = trialEnd;
    }

    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        console.error('Password Hashing Failed:', err.message);
        throw err;
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Single source of truth for access checks.
// Never reason about subscriptionState directly in routes — always call this.
UserSchema.methods.hasActiveAccess = function() {
    const valid = ['TRIALING', 'ACTIVE'].includes(this.subscriptionState);
    const notExpired = this.currentPeriodEnd && this.currentPeriodEnd > new Date();
    return valid && notExpired;
};

UserSchema.methods.toSubscriptionInfo = function() {
    return {
        state: this.subscriptionState,
        trialEndsAt: this.trialEndsAt,
        currentPeriodEnd: this.currentPeriodEnd,
        hasActiveAccess: this.hasActiveAccess()
    };
};

UserSchema.methods.toProfile = function() {
    return {
        id: this.id,
        email: this.email,
        shopName: this.shopName,
        ownerName: this.ownerName,
        phone: this.phone,
        createdAt: this.createdAt
    };
};

UserSchema.statics.TRIAL_DAYS = TRIAL_DAYS;

module.exports = mongoose.model('User', UserSchema);
