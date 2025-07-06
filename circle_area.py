
"""
圆的面积计算程序
输入半径，计算并输出圆的面积
"""

import math

def calculate_circle_area(radius):
    """
    计算圆的面积
    
    Args:
        radius (float): 圆的半径
        
    Returns:
        float: 圆的面积
    """
    if radius <= 0:
        raise ValueError("半径不能为负数或零")
    
    area = math.pi * radius ** 2
    return area

def main():
    """主函数"""
    print("=== 圆的面积计算器 ===")
    
    try:
        # 获取用户输入
        radius = float(input("请输入圆的半径: "))
        
        # 计算面积
        area = calculate_circle_area(radius)
        
        # 输出结果
        print(f"半径为 {radius} 的圆的面积是: {area:.2f}")
        print(f"精确值: {area}")
        
    except ValueError as e:
        if "半径不能为负数或零" in str(e):
            print("错误: 半径不能为负数或零，请输入正数。")
        else:
            print("错误: 请输入有效的数字。")
    except Exception as e:
        print(f"发生未知错误: {e}")

if __name__ == "__main__":
    main()
