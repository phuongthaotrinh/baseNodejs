import Attribute from "../models/attributes.model";
const slugify = require('slugify');
const validator = require('validator');

const checkByCondition = async(condition) => {
  const res = await  Attribute.findOne(condition).exec();
  return res;
}


export const create = async (req, res) => {
    const body = req.body;
      const checkParentValue  = await checkByCondition({value: body.value});
      const checkParentName  = await checkByCondition({name: body.name});
    
      if(checkParentValue || checkParentName){
        return res.status(400).json({
          message: "Item đã được đăng ký", 
          status: 400, 
          object: null
        })
      }

      const response =  await Attribute(body).save();
  
      res.status(200).json({
        status: 200, 
        message: "Tao thành công",
        object: response
      });
    

}

export const list = async (req, res) => {
  const { status } = req.query;

  try {
    const {limit, skip} = req.query;
    const allData = await Attribute.find({})
                              .limit(limit)
                              .skip(skip)
                              .sort({createdAt: -1}).exec();

    const data = await Attribute.find({status: status})
                            .limit(limit)
                            .skip(skip)
                            .sort({createdAt: -1}).exec();

    

    res.status(200).json({
      status: 200, 
      message: "Lấy danh sách thành công",
      object: {
        data: status ? data : allData,
        totalPage: status ? data.length : allData.length,
        skip: skip,
        limit:limit,
        now: status ? data.length : allData.length
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Lấy danh sách thất bại",
      object: error
    });
  }

}

export const remove = async (req, res) => {
  const {id} = req.params
  try {
    if(!id) {
      res.status(400).json({
        status: 400,
        message: "Không tìm thấy dữ liệu ",
        object: null
      })
    }

    const data = await Attribute.findOneAndUpdate({ _id: req.params.id }, {status: false}, { new: true }).exec();
    res.status(200).json(
      {
        status: 200,
        message: "Cập nhật thành công",
        object: data
      }
    );
  } catch (error) {
    res.status(500).json({
      status: 200, 
      message: "Cập nhật thất bại",
      object: error
    })
  }
}

export const read = async (req, res) => {
  try {
    const data = await Attribute.findOne({ _id: req.params.id }).exec();
    res.status(200).json({
      status: 200, 
      message: "Lấy dữ liệu thành công",
      object: data
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(
      {
        status: 200, 
        message: "Lấy dữ liệu thất bại",
        object: error
      }
    );
  }

}

export const update = async (req, res) => {
  try {
    const body = req.body;




  } catch (error) {
    
  }
}