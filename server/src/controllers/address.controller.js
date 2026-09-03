import User from '../models/User.js';

const validateAddress = (address) => {
  if (!address || !address.fullName || !address.phone ||
      !address.addressLine1 || !address.city ||
      !address.state || !address.pincode) {
    return false;
  }
  return true;
};

export const getMyAddresses = async (req, res) => {
  try {
    res.json(req.user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    if (!validateAddress(req.body)) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const { fullName, phone, addressLine1, addressLine2 = '', city, state, pincode, isDefault = false } = req.body;

    const user = req.user;
    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    } else if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    const newAddress = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: user.addresses.length === 0 ? true : isDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = addr._id.toString() === id; });
    }

    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.deleteOne();
    await user.save();
    res.json({ message: 'Address removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
