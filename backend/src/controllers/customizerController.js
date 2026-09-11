import { customizerOptions } from '../data/seedData.js';
import { dbGetCharms, dbGetBeads } from '../data/dbStore.js';

export const getCustomizerOptions = async (req, res) => {
  try {
    const liveCharms = await dbGetCharms();
    const liveBeads = await dbGetBeads();
    const options = {
      ...customizerOptions,
      charms: liveCharms && liveCharms.length > 0 ? liveCharms : customizerOptions.charms,
      beads: liveBeads && liveBeads.length > 0 ? liveBeads : customizerOptions.beads
    };
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateCustomPrice = async (req, res) => {
  try {
    const { cordId, mainBeadId, secondaryBeadId, charmId, sizeId } = req.body;
    const liveCharms = await dbGetCharms();
    const liveBeads = await dbGetBeads();
    const availableCharms = liveCharms && liveCharms.length > 0 ? liveCharms : customizerOptions.charms;
    const availableBeads = liveBeads && liveBeads.length > 0 ? liveBeads : customizerOptions.beads;

    const cord = customizerOptions.cords.find(c => c.id === cordId) || customizerOptions.cords[0];
    const mainBead = availableBeads.find(b => b.id === mainBeadId) || availableBeads[0];
    const charm = availableCharms.find(c => c.id === charmId);
    const size = customizerOptions.sizes.find(s => s.id === sizeId) || customizerOptions.sizes[1];

    let beadTotal = 0;
    const totalBeads = size.beadCount || 21;

    if (Array.isArray(beadSlots) && beadSlots.length > 0) {
      beadTotal = beadSlots.reduce((sum, slot) => {
        const beadId = typeof slot === 'string' ? slot : slot?.id;
        const b = availableBeads.find(x => x.id === beadId) || mainBead;
        return sum + (b?.pricePerBead || 800);
      }, 0);
    } else if (secondaryBeadId) {
      const secondaryBead = availableBeads.find(b => b.id === secondaryBeadId) || mainBead;
      const mainCount = Math.ceil(totalBeads * 0.7);
      const secondaryCount = totalBeads - mainCount;
      beadTotal = (mainCount * mainBead.pricePerBead) + (secondaryCount * secondaryBead.pricePerBead);
    } else {
      beadTotal = totalBeads * mainBead.pricePerBead;
    }

    const cordPrice = cord.price || 0;
    const charmPrice = charm ? charm.price : 0;
    const craftingFee = 0; // Tặng miễn phí 100% công xâu đan thủ công cho khách tự phối

    const totalPrice = cordPrice + beadTotal + charmPrice + craftingFee;

    res.json({
      success: true,
      data: {
        totalPrice,
        breakdown: {
          cord: { name: cord.name, price: cordPrice },
          beads: { name: mainBead.name, count: totalBeads, price: beadTotal },
          charm: charm ? { name: charm.name, price: charmPrice } : null,
          craftingFee: { name: 'Công xâu đan thủ công & thanh tẩy thảo mộc', price: craftingFee }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
